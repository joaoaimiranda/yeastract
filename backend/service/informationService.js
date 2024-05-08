import {
    multiSearch,
    getORFinfo,
    getPossibleMatches,
} from "../db/repository.js";

export async function advancedSearch(params) {
    if (params["term"] === undefined) throw new Error("No Search Term");
    else if (params["species"] === undefined)
        throw new Error("No species specified");

    const term = params["term"].trim();
    if (term === "") throw new Error("Search Term Not Accepted");

    const orf = await multiSearch(term, params["species"]);
    console.log(orf);

    if (orf !== -1) {
        const matches = await getORFinfo(orf);
        return { fullMatch: true, matches: matches };
    } else {
        const matches = await getPossibleMatches(term, params["species"]);
        return { fullMatch: false, matches: matches };
    }
}
