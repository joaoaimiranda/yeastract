import {
    getIDs,
    getSequence,
    getMotifsFromDB,
    getAllIDs,
} from "../db/repository.js";

export async function motifOnPromoter(params) {
    if (
        params.motif === undefined ||
        params.genes === undefined ||
        params.substitutions === undefined ||
        params.species === undefined
    ) {
        // res.status(400).send("Bad Request");
        throw new Error("Bad Request");
    }

    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);
    const consensus = params.motif.trim().split(/[\s|]+/);
    if (geneNames[0] === "" || consensus[0] === "") {
        // res.status(400).send(
        //     "Bad Request - no valid genes or motifs specified"
        // );
        throw new Error("Bad Request");
    }

    let inputMotif = [];
    for (let c of consensus) {
        const m = c.trim();
        if (m.length !== 0) {
            const [motif, good] = motifIUPACcompress(m);
            if (good) inputMotif.push(motif);
        }
    }

    const geneIdList = await getIDs(geneNames, params.species);
    // Promise.all(geneIdList)
    //     .then((ids) => upstreamSeq(ids))
    //     .then((values) =>
    //         tfBindingSites(inputMotif, values, params.substitutions)
    //     )
    //     .then((values) => res.status(200).json(values));
    const seqs = await upstreamSeq(geneIdList);
    const tfbs = tfBindingSites(inputMotif, seqs, params.substitutions);
    return tfbs;
}

export async function tfbsByMotif(params) {
    if (params.motif === undefined || params.substitutions === undefined) {
        // res.status(400).send("Bad Request");
        throw new Error("Bad Request");
    }

    const [motif, good] = motifIUPACcompress(
        params.motif.trim(),
        params.substitutions
    );
    if (!good) throw new Error("Invalid Motif");

    const dbCons = await getMotifsFromDB();

    let ret1 = [];
    let ret2 = [];
    for (let dbRes of dbCons) {
        const seq = dbRes["seq"];
        const tmp_ret1 = { seq: seq, tfs: dbRes["tfs"], F: null, R: null };
        const tmp_ret2 = { seq: seq, tfs: dbRes["tfs"], F: null, R: null };
        const matches1 = shiftAnd(motif, seq, params.substitutions);
        if (!objectEmpty(matches1)) tmp_ret1["F"] = matches1;
        // prettier-ignore
        const matches2 = shiftAnd(motifComplement(motif), seq, params.substitutions);
        if (!objectEmpty(matches2)) tmp_ret1["R"] = matches2;
        const matches3 = shiftAnd(seq, motif, params.substitutions);
        if (!objectEmpty(matches3)) tmp_ret2["F"] = matches3;
        // prettier-ignore
        const matches4 = shiftAnd(seq, motifComplement(motif), params.substitutions);
        if (!objectEmpty(matches4)) tmp_ret2["R"] = matches4;

        if (!(tmp_ret1["F"] === null && tmp_ret1["R"] === null))
            ret1.push(tmp_ret1);
        if (!(tmp_ret2["F"] === null && tmp_ret2["R"] === null))
            ret2.push(tmp_ret2);
    }
    // res.status(200).json([ret1, ret2]);

    return [ret1, ret2];
    //what now
}

export async function seqRetrieval(params) {
    if (params.genes === undefined || params.species === undefined) {
        // res.status(400).send("Bad Request");
        throw new Error("Bad Request");
    }
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);
    const from = isNaN(params.from) ? -1000 : Number(params.from);
    const to = isNaN(params.to) ? -1 : Number(params.to);
    let idList = [];
    if (geneNames[0] === "") {
        idList = await getAllIDs(params.species);
    } else {
        idList = await getIDs(geneNames, params.species);
    }
    const seqs = await upstreamSeq(idList, from, to);
    return seqs;
}

export async function promoterAnalysis(params) {
    if (
        params.genes === undefined ||
        params.species === undefined ||
        params.tfbs_species === undefined ||
        params.orthologs === undefined ||
        params.synteny === undefined
    ) {
        throw new Error("Bad Request");
    }
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);
}

export async function tfConsensus(params) {
    console.log(params);
    if (params.species === undefined) {
        throw new Error("Bad Request");
    }
    const consList = await getMotifsFromDB(true, params.species);
    return consList;
}

async function upstreamSeq(ids, from = -1000, to = -1) {
    if (ids.length === 0) return [];
    const size = to - from + 1;
    const start = from + 1000;
    const res = await getSequence(ids);

    let seqs = {};
    for (let row of res) {
        const lines = row["promoterseq"].split("\n");
        lines.shift();
        const seq = lines.join("").substring(start, size);
        const id = row["gene"] !== "Uncharacterized" ? row["gene"] : row["orf"];
        seqs[id] = seq;
    }
    return seqs;
}

function tfBindingSites(motifs, sequences, subst = 0) {
    let retObj = {};
    for (let m of motifs) {
        const matches = getMatches(recursiveSplit(m), sequences, subst);
        for (let orfid of Object.keys(matches)) {
            if (!retObj[orfid]) retObj[orfid] = [];
            retObj[orfid].push({ motif: m, matches: matches[orfid] });
        }
    }
    return retObj;
}

function motifIUPACcompress(m) {
    let motif = m.toUpperCase();
    if (motif.includes("/")) {
        motif = motif.replaceAll("/", "");
        motif = motif.replaceAll("(", "[");
        motif = motif.replaceAll(")", "]");
    }

    if (motif.includes("[") || motif.includes("]")) {
        motif = motif.replaceAll(/\[AT\]|\[TA\]/g, "W");
        motif = motif.replaceAll(/\[CG\[|\[GC\]/g, "S");
        motif = motif.replaceAll(/\[AG\[|\[GA\]/g, "R");
        motif = motif.replaceAll(/\[TC\[|\[CT\]/g, "Y");
        motif = motif.replaceAll(/\[AC\[|\[CA\]/g, "M");
        motif = motif.replaceAll(/\[TG\[|\[GT\]/g, "K");

        motif = motif.replaceAll(
            /\[ATG\[|\[AGT\[|\[GAT\[|\[GTA\[|\[TGA\[|\[TAG\]/g,
            "D"
        );
        motif = motif.replaceAll(
            /\[ATC\[|\[ACT\[|\[CAT\[|\[CTA\[|\[TCA\[|\[TAC\]/g,
            "H"
        );
        motif = motif.replaceAll(
            /\[ACG\[|\[AGC\[|\[GAC\[|\[GCA\[|\[CGA\[|\[CAG\]/g,
            "V"
        );
        motif = motif.replaceAll(
            /\[TGC\[|\[TCG\[|\[GTC\[|\[GCT\[|\[CTG\[|\[CGT\]/g,
            "B"
        );

        motif = motif.replaceAll(
            /\[ATGC\[|\[ATCG\[|\[AGTC\[|\[AGCT\[|\[ACTG\[|\[ACGT\[|\[TGCA\[|\[TGAC\[|\[TCGA\[|\[TCAG\[|\[TAGC\[|\[TACG\[|\[GATC\[|\[GACT\[|\[GTAC\[|\[GTCA\[|\[GCAT\[|\[GCTA\[|\[CATG\[|\[CAGT\[|\[CTAG\[|\[CTGA\[|\[CGAT\[|\[CGTA\]/g,
            "N"
        );
    }
    //incase go back
    // motif = motif.replaceAll(/\[AT\]|\[TA\]/, "W");
    // motif = motif.replaceAll(["[CG]","[GC]"], "S");
    // motif = motif.replaceAll(["[AG]","[GA]"], "R");
    // motif = motif.replaceAll(["[TC]","[CT]"], "Y");
    // motif = motif.replaceAll(["[AC]","[CA]"], "M");
    // motif = motif.replaceAll(["[TG]","[GT]"], "K");

    // motif = motif.replaceAll(["[ATG]","[AGT]","[GAT]","[GTA]","[TGA]","[TAG]"], "D");
    // motif = motif.replaceAll(["[ATC]","[ACT]","[CAT]","[CTA]","[TCA]","[TAC]"], "H");
    // motif = motif.replaceAll(["[ACG]","[AGC]","[GAC]","[GCA]","[CGA]","[CAG]"], "V");
    // motif = motif.replaceAll(["[TGC]","[TCG]","[GTC]","[GCT]","[CTG]","[CGT]"], "B");
    // n = ["[ATGC]","[ATCG]","[AGTC]","[AGCT]","[ACTG]","[ACGT]",
    //            "[TGCA]","[TGAC]","[TCGA]","[TCAG]","[TAGC]","[TACG]",
    //            "[GATC]","[GACT]","[GTAC]","[GTCA]","[GCAT]","[GCTA]",
    //            "[CATG]","[CAGT]","[CTAG]","[CTGA]","[CGAT]","[CGTA]"];
    // motif = motif.replaceAll(n, "N");

    const good = !(motif.includes("[") || motif.includes("]"));
    return [motif, good];
}

function getMatches(boxesList, sequences, subst) {
    let retObj = {};

    for (let orfid of Object.keys(sequences)) {
        const seq = sequences[orfid];
        let matchesF = [];
        let matchesR = [];
        for (let i = 0; i < boxesList.length; i++) {
            if (i == 0) {
                matchesF[i] = shiftAnd(boxesList[i], seq, subst);
                matchesR[i] = shiftAnd(
                    boxesList[i],
                    IUPACcomplement(seq).split("").reverse().join(""),
                    subst
                );
                if (objectEmpty(matchesF[i]) && objectEmpty(matchesR[i])) break;
            } else if (i & 1) {
                /* odd, do nothing */
            } else {
                // even, verify previous matches
                if (!objectEmpty(matchesF[i - 2])) {
                    const startF = Object.keys(matchesF[i - 2])[0];
                    const boxLenF = matchesF[i - 2][startF];
                    const minGap = boxesList[i - 1][0];
                    const maxGap = boxesList[i - 1][1];
                    const offsetF = startF + boxLenF + minGap;
                    matchesF[i] = shiftAnd(
                        boxesList[i],
                        seq.substring(offsetF),
                        subst
                    );

                    for (let oldkey of Object.keys(matchesF[i])) {
                        let newkey = oldkey + offsetF;
                        let keep = false;
                        let newlen;
                        for (let pos of Object.keys(matchesF[i - 2])) {
                            const size = matchesF[i - 2][pos];
                            const gap = newkey - size - pos;
                            if (gap >= minGap && gap <= maxGap) {
                                keep = true;
                                newkey = pos;
                                newlen = size + gap + matchesF[i][oldkey];
                                break;
                            }
                        }
                        if (keep) matchesF[i][newkey] = newlen;
                        delete matchesF[i][oldkey];
                    }
                    delete matchesF[i - 2];
                }
                if (!objectEmpty(matchesR[i - 2])) {
                    const startR = Object.keys(matchesR[i - 2])[0];
                    const boxLenR = matchesR[i - 2][startR];
                    const minGap = boxesList[i - 1][0];
                    const maxGap = boxesList[i - 1][1];
                    const offsetR = startR + boxLenR + minGap;
                    const revStr = IUPACcomplement(seq)
                        .split("")
                        .reverse()
                        .join("");
                    matchesR[i] = shiftAnd(
                        boxesList[i],
                        revStr.substring(offsetR),
                        subst
                    );

                    for (let oldkey of Object.keys(matchesR[i])) {
                        let newkey = oldkey + offsetR;
                        let keep = false;
                        let newlen;
                        for (let pos of Object.keys(matchesR[i - 2])) {
                            const size = matchesR[i - 2][pos];
                            const gap = newkey - size - pos;
                            if (gap >= minGap && gap <= maxGap) {
                                keep = true;
                                newkey = pos;
                                newlen = size + gap + matchesR[i][oldkey];
                                break;
                            }
                        }
                        if (keep) matchesR[i][newkey] = newlen;
                        delete matchesR[i][oldkey];
                    }
                    delete matchesR[i - 2];
                }
            }
            if (i === boxesList.length - 1) {
                retObj[orfid] = { F: null, R: null };
                if (!objectEmpty(matchesF[i])) {
                    retObj[orfid]["F"] = matchesF[i];
                }
                if (!objectEmpty(matchesR[i])) {
                    retObj[orfid]["R"] = matchesR[i];
                }
            }
        }
    }
    return retObj;
}

function recursiveSplit(motif) {
    let motifList = [];
    let gap = [];
    let boxesList = [];

    if (!motif.includes("{")) {
        return [motif];
    }
    if (motif.includes(",")) {
        motifList = motif.split(/[N]{(\d*),(\d*)}/);
        gap = [...motif.matchAll(/\d+,\d+/)];
    } else {
        let str = "";
        for (let i = 0, last = 0; i < motif.length; i++) {
            if (motif[i] === "{") {
                i++;
                let n = "";
                while (motif[i] !== "}") {
                    n += motif[i];
                    i++;
                }
                for (let j = 0; j < n; j++) {
                    str += motif[last];
                }
            } else {
                str += motif[i];
                last = i;
            }
        }
        motifList = [str];
    }
    let k = 0;
    for (let box of motifList) {
        if (!box.includes("{")) {
            boxesList.push(box);
            if (gap[0][k].length !== 0) {
                const tmp = gap[0][k].split(",");
                boxesList.push(...tmp);
            }
        } else {
            // recursive call
            const aux = shiftAndWrapper(box);
            for (let subaux of aux) {
                boxesList.push(...subaux);
            }
            if (gap[0][k].length !== 0) {
                const tmp = gap[0][k].split(",");
                boxesList.push(...tmp);
            }
        }
        k++;
    }

    return boxesList;
}

function shiftAnd(pat, seq, subst = 0) {
    const pattern = pat.trim().toUpperCase();
    const pSize = pattern.length;
    // const nBoxes = 1;
    const b = pSize - 1;
    const p = 1 * 4;
    const boxEndBits = 0x01 << b % p;
    const boxBeginBits = (boxEndBits << 1) | 1;

    let retObj = {};

    let s = {
        A: 0,
        C: 0,
        T: 0,
        G: 0,
        R: 0,
        Y: 0,
        S: 0,
        W: 0,
        K: 0,
        M: 0,
        B: 0,
        D: 0,
        H: 0,
        V: 0,
        N: 0,
        X: 0,
    };
    let mask = 1;
    for (let i = 0; i < pSize; i++) {
        s[pattern[i]] |= mask;
        mask = mask << 1;
    }
    s["A"] |=
        s["R"] | s["W"] | s["M"] | s["D"] | s["H"] | s["V"] | s["N"] | s["X"];
    s["C"] |=
        s["Y"] | s["S"] | s["M"] | s["B"] | s["H"] | s["V"] | s["N"] | s["X"];
    s["T"] |=
        s["Y"] | s["W"] | s["K"] | s["B"] | s["D"] | s["H"] | s["N"] | s["X"];
    s["G"] |=
        s["R"] | s["S"] | s["K"] | s["B"] | s["D"] | s["V"] | s["N"] | s["X"];

    s["R"] = s["A"] | s["G"];
    s["Y"] = s["C"] | s["T"];
    s["S"] = s["C"] | s["G"];
    s["W"] = s["A"] | s["T"];
    s["K"] = s["G"] | s["T"];
    s["M"] = s["A"] | s["C"];

    s["B"] = s["C"] | s["T"] | s["G"];
    s["D"] = s["A"] | s["G"] | s["T"];
    s["H"] = s["C"] | s["T"] | s["A"];
    s["V"] = s["C"] | s["A"] | s["G"];

    s["N"] = s["A"] | s["C"] | s["T"] | s["G"];
    s["X"] = s["A"] | s["C"] | s["T"] | s["G"];

    const text = seq.trim();
    const tSize = text.length;
    let S = [];
    for (let i = 0; i <= subst; i++) {
        S[i] = 0;
    }
    let i = 0;
    mask = mask >> 1;
    while (i < tSize) {
        let V = (S[0] << 1) | boxBeginBits;
        S[0] = ((S[0] << 1) | 1) & s[text[i]];
        let j = 1;
        while (j <= subst) {
            let W = (S[j] << 1) | boxBeginBits;
            S[j] = ((S[j] << 1) & s[text[i]]) | V;
            V = W;
            j++;
        }
        j = 0;
        while (j <= subst) {
            if (S[j] & mask) {
                const res = i - pSize + 1;
                retObj[res] = pSize;
                j = subst;
            }
            j++;
        }
        i++;
    }
    return retObj;
}

function IUPACcomplement(seq) {
    const n = seq.length;
    let comp = "";
    for (let i = 0; i < n + 1; i++) {
        switch (seq[i]) {
            case "A":
                comp = comp.concat("T");
                break;
            case "T":
                comp = comp.concat("A");
                break;
            case "G":
                comp = comp.concat("C");
                break;
            case "C":
                comp = comp.concat("G");
                break;

            case "R":
                comp = comp.concat("Y");
                break;
            case "Y":
                comp = comp.concat("R");
                break;
            case "M":
                comp = comp.concat("K");
                break;
            case "K":
                comp = comp.concat("M");
                break;

            case "D":
                comp = comp.concat("H");
                break;
            case "H":
                comp = comp.concat("D");
                break;
            case "V":
                comp = comp.concat("B");
                break;
            case "B":
                comp = comp.concat("V");
                break;

            default:
                comp = comp.concat(seq[i]);
        }
    }
    return comp;
}

function motifComplement(motif) {
    let comp = "";
    const n = motif.length - 1;
    for (let i = 0; i < n + 1; i++) {
        switch (motif[n - i]) {
            case "A":
            case "a":
                comp = comp.concat("T");
                break;
            case "T":
            case "t":
                comp = comp.concat("A");
                break;
            case "G":
            case "g":
                comp = comp.concat("C");
                break;
            case "C":
            case "c":
                comp = comp.concat("G");
                break;

            case "R":
            case "r":
                comp = comp.concat("Y");
                break;
            case "Y":
            case "y":
                comp = comp.concat("R");
                break;
            case "M":
            case "m":
                comp = comp.concat("K");
                break;
            case "K":
            case "k":
                comp = comp.concat("M");
                break;

            case "D":
            case "d":
                comp = comp.concat("H");
                break;
            case "H":
            case "h":
                comp = comp.concat("D");
                break;
            case "V":
            case "v":
                comp = comp.concat("B");
                break;
            case "B":
            case "b":
                comp = comp.concat("V");
                break;

            // N, W, S
            default:
                comp = comp.concat(motif[n - i]);
        }
    }
    return comp;
}

// AUXILIARY FUNCTION
function objectEmpty(obj) {
    for (let prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }

    return true;
}
