import {
    multiSearch,
    getORFinfo,
    getPossibleMatches,
    getID,
    getProteinInfo,
    getGOinfo,
    getOrthologInfo,
    getTFBSinfo,
    getGOtermInfo,
    getMetabGeneInfo,
    getReactionInfo,
    getRegulationInfo,
} from "../db/repository.js";

export async function advancedSearch(params) {
    if (params["term"] === undefined) throw new Error("No Search Term");
    else if (params["species"] === undefined)
        throw new Error("No species specified");

    const term = params["term"].trim();
    if (term === "") throw new Error("Search Term Not Accepted");

    const orf = await multiSearch(term, params["species"]);
    console.log(orf);

    if (orf !== null) {
        // const matches = await getORFinfo(orf);
        return { fullMatch: true, matches: orf };
    } else {
        const matches = await getPossibleMatches(term, params["species"]);
        return { fullMatch: false, matches: matches };
    }
}

export async function getORF(params) {
    const orf = params["orf"].trim();
    if (orf === "") throw new Error("ORF name is empty");
    console.log(orf);
    const id = await getID(orf, params.species);
    if (id === -1) throw new Error("ORF/Gene not found");
    const orfInfo = await getORFinfo(id);
    const protInfo = await getProteinInfo(id);
    const goInfo = await getGOinfo(id);
    const orthologInfo = await getOrthologInfo(id, params.species);
    const metabInfo = await getMetabGeneInfo(id, params.species);
    return {
        general: orfInfo["general"],
        locus: orfInfo["locus"],
        protein: protInfo,
        go: goInfo,
        orthologs: orthologInfo,
        metab: metabInfo.length > 0 ? metabInfo : false,
    };
}

export async function tfbs(params) {
    if (
        params.protein === undefined ||
        params.consensus === undefined ||
        params.species === undefined
    )
        throw new Error("Bad Request");

    const id = await getID(params.protein, params.species);
    if (id === -1) throw new Error("nf");
    const info = await getTFBSinfo(id, params.consensus);
    return info;
}

export async function mreaction(params) {
    if (params.modname === undefined || params.rid === undefined)
        throw new Error("Bad Request");

    const info = await getReactionInfo(params.modname, params.rid);
    return info;
}

export async function goterm(params) {
    if (params.goid === undefined || params.species === undefined)
        throw new Error("Bad Request");

    const info = await getGOtermInfo(params.goid, params.species);
    return info;
}

export async function regulation(params) {
    if (
        params.orf === undefined ||
        params.protein === undefined ||
        params.species === undefined
    )
        throw new Error("Bad Request");

    const orfid = await getID(params.orf, params.species);
    const tfid = await getID(params.protein, params.species);
    if (orfid === -1) throw new Error("orfnf");
    if (tfid === -1) throw new Error("tfnf");

    const info = await getRegulationInfo(tfid, orfid, params.species);
    return info;
}
