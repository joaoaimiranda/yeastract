import {
    multiSearch,
    getORFinfo,
    getPossibleMatches,
    getID,
    getProteinInfo,
    getGOinfo,
    getOrthologInfo,
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
    const id = await getID(orf, params["species"]);
    if (id === -1) throw new Error("ORF/Gene not found");
    const orfInfo = await getORFinfo(id);
    const protInfo = await getProteinInfo(id);
    const goInfo = await getGOinfo(id);
    const orthologInfo = await getOrthologInfo(id, params["species"]);
    return {
        general: orfInfo["general"],
        locus: orfInfo["locus"],
        protein: protInfo,
        go: goInfo,
        orthologs: orthologInfo,
    };
}
