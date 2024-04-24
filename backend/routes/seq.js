const dbaccess = require("../db/dbaccess");
var express = require("express");
var router = express.Router();

router.post("/motif-on-promoter", motifOnPromoter);
router.post("/tfbs-by-motif", tfbsByMotif);

function motifOnPromoter(req, res, next) {
    params = req.body;
    if (
        params.motif === undefined ||
        params.genes === undefined ||
        params.substitutions === undefined
    ) {
        res.status(400).send("Bad Request");
    }

    const geneNames = params.genes.split(/[\s\t\n\r\0,;|]+/);
    const consensus = params.motif.trim().split(/[\s|]+/);
    if (geneNames[0] === "" || consensus[0] === "") {
        res.status(400).send(
            "Bad Request - no valid genes or motifs specified"
        );
        return;
    }

    let inputMotif = [];
    consensus.forEach((c) => {
        const m = c.trim();
        if (m.length !== 0) {
            const [motif, good] = motifIUPACcompress(m);
            if (good) inputMotif.push(motif);
        }
    });

    const geneIdList = geneNames.map((element) => getID(element));
    Promise.all(geneIdList)
        .then((ids) => upstreamSeq(ids))
        .then((values) =>
            tfBindingSites(inputMotif, values, params.substitutions)
        )
        .then((values) => res.status(200).json(values));
}

function tfbsByMotif(req, res, next) {
    params = req.body;
    if (params.motif === undefined || params.substitutions === undefined) {
        res.status(400).send("Bad Request");
    }

    const [motif, good] = motifIUPACcompress(
        params.motif.trim(),
        params.substitutions
    );
    if (!good) res.status(400).send("Bad Request - motif not valid");

    const dbCons = getMotifsFromDB();

    let ret1,
        ret2 = [];
    dbCons.forEach((seq) => {
        ret1[seq] = { F: null, R: null };
        ret2[seq] = { F: null, R: null };
        const matches1 = shiftAnd(motif, seq, params.substitutions);
        if (matches1.length !== 0) ret1[seq]["F"] = matches1;
        const matches2 = shiftAnd(
            motifComplement(motif),
            seq,
            params.substitutions
        );
        if (matches2.length !== 0) ret1[seq]["R"] = matches2;
        const matches3 = shiftAnd(seq, motif, params.substitutions);
        if (matches3.length !== 0) ret2[seq]["F"] = matches3;
        const matches4 = shiftAnd(
            seq,
            motifComplement(motif),
            params.substitutions
        );
        if (matches4.length !== 0) ret2[seq]["R"] = matches4;
    });

    //what now
}
async function getID(element) {
    const q1 = `select O.orfid from orfgene as O LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='${element}' or O.gene='${element}') and O.species in ('Saccharomyces cerevisiae S288c');`;

    const q2 = `select O.orfid from orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid and A.alias='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

    const q3 = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

    return Promise.any([
        dbaccess.query(q1),
        dbaccess.query(q2),
        dbaccess.query(q3),
    ]).then((value) => value[0][0]["orfid"]);
}

async function upstreamSeq(ids) {
    if (ids.length === 0) return [];
    const q = `select orfid,promoterseq from orfgene where orfid in (${ids})`;
    const res = await dbaccess.query(q);
    let seqs = {};
    res[0].forEach((row) => {
        const lines = row["promoterseq"].split("\n");
        lines.shift();
        const seq = lines.join().substring(0, 1000);
        seqs[row["orfid"]] = seq;
    });
    return seqs;
}

function tfBindingSites(motifs, sequences, subst = 0) {
    retObj = {};
    motifs.forEach((motif) => {
        const matches = getMatches(recursiveSplit(motif), sequences, subst);
        for (orfid of Object.keys(matches)) {
            if (!retObj[orfid]) retObj[orfid] = [];
            retObj[orfid].push({ motif: motif, matches: matches[orfid] });
        }
    });
    return retObj;
}

async function getMotifsFromDB(bsrgOnly = true) {
    // FIXME SPECIES HARDCODED
    const q =
        "select distinct P.tfid, P.protein, C.IUPACseq from protein as P, " +
        "consensus as C, tfconsensus as TFC, orfgene as O where " +
        "C.consensusid=TFC.consensusid and TFC.tfid=P.tfid and " +
        "P.tfid=O.orfid and O.species='Saccharomyces cerevisiae S288c'" +
        " and TFC.source='BSRG curated'";

    const res = await dbaccess.query(q);
    let ret = [];
    res[0].forEach((row) => {
        if (ret.some((element) => element["seq"] === row["IUPACseq"])) {
            ret.find((element) => element["seq"] === row["IUPACseq"])[
                "protein"
            ].push(row["protein"]);
        } else {
            ret.push({ protein: [row["protein"]], seq: row["IUPACseq"] });
        }
    });
    return ret;
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

    for (orfid of Object.keys(sequences)) {
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
                if (matchesF[i].length === 0 && matchesR[i].length === 0) break;
            } else if (i & 1) {
                /* odd, do nothing */
            } else {
                // even, verify previous matches
                if (matchesF[i - 2].length !== 0) {
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

                    for (oldkey of Object.keys(matchesF[i])) {
                        let newkey = oldkey + offsetF;
                        let keep = false;
                        let newlen;
                        for (pos of Object.keys(matchesF[i - 2])) {
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
                if (matchesR[i - 2].length !== 0) {
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

                    for (oldkey of Object.keys(matchesR[i])) {
                        let newkey = oldkey + offsetR;
                        let keep = false;
                        let newlen;
                        for (pos of Object.keys(matchesR[i - 2])) {
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
                if (matchesF[i].length !== 0) {
                    retObj[orfid]["F"] = matchesF[i];
                }
                if (matchesR[i].length !== 0) {
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
    motifList.forEach((box) => {
        if (!box.includes("{")) {
            boxesList.push(box);
            if (gap[0][k].length !== 0) {
                const tmp = gap[0][k].split(",");
                boxesList.push(...tmp);
            }
        } else {
            // recursive call
            const aux = shiftAndWrapper(box);
            aux.forEach((subaux) => {
                boxesList.push(...subaux);
            });
            if (gap[0][k].length !== 0) {
                const tmp = gap[0][k].split(",");
                boxesList.push(...tmp);
            }
        }
        k++;
    });

    return boxesList;
}

function shiftAnd(pat, seq, subst = 0) {
    const pattern = pat.trim().toUpperCase();
    const pSize = pattern.length;
    const nBoxes = 1;
    const b = pSize - 1;
    const p = 1 * 8;
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
    for (let i = 0; i < seq.length; i++) {
        switch (seq[i]) {
            case "A":
                seq[i] = "T";
                break;
            case "T":
                seq[i] = "A";
                break;
            case "G":
                seq[i] = "C";
                break;
            case "C":
                seq[i] = "G";
                break;

            case "R":
                seq[i] = "Y";
                break;
            case "Y":
                seq[i] = "R";
                break;
            case "M":
                seq[i] = "K";
                break;
            case "K":
                seq[i] = "M";
                break;

            case "D":
                seq[i] = "H";
                break;
            case "H":
                seq[i] = "D";
                break;
            case "V":
                seq[i] = "B";
                break;
            case "B":
                seq[i] = "V";
                break;
        }
    }
    return seq;
}

function motifComplement(motif) {
    let comp = motif;
    const n = motif.length - 1;
    for (i = 0; i < n + 1; i++) {
        switch (motif[i]) {
            case "A":
            case "a":
                comp[n - i] = "T";
                break;
            case "T":
            case "t":
                comp[n - i] = "A";
                break;
            case "G":
            case "g":
                comp[n - i] = "C";
                break;
            case "C":
            case "c":
                comp[n - i] = "G";
                break;

            case "R":
            case "r":
                comp[n - i] = "Y";
                break;
            case "Y":
            case "y":
                comp[n - i] = "R";
                break;
            case "M":
            case "m":
                comp[n - i] = "K";
                break;
            case "K":
            case "k":
                comp[n - i] = "M";
                break;

            case "D":
            case "d":
                comp[n - i] = "H";
                break;
            case "H":
            case "h":
                comp[n - i] = "D";
                break;
            case "V":
            case "v":
                comp[n - i] = "B";
                break;
            case "B":
            case "b":
                comp[n - i] = "V";
                break;

            // N, W, S
            default:
                comp[n - i] = motif[i];
        }
    }
    return comp;
}

module.exports = router;
