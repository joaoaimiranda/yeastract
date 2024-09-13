import {
    getRegulations,
    getRegulationsByTF,
    getMegaRegulationsByTF,
    getRegulationsByGene,
    getMegaRegulationsByGene,
    getRegulationsByTFAndGene,
    getMegaRegulations,
    getAllRegulations,
    getMegaAllRegulations,
    getAllGenesByTF,
    getIDs,
    getGOids,
    getHomoIDs,
    getTotalNumDBGenes,
    getAllTFids,
} from "../db/repository.js";
import hypergeometric from "./hypergeometric.js";

export async function searchRegulations(params) {
    if (
        params.tfs === undefined ||
        params.genes === undefined ||
        // params.documented === undefined ||
        // params.activator === undefined ||
        // params.inhibitor === undefined ||
        // params.noexprinfo === undefined ||
        // params.envconGroup === undefined ||
        // params.envconSubgroup === undefined ||
        // params.synteny === undefined ||
        params.species === undefined
    ) {
        throw new Error("Bad Request");
    }

    const tfNames = params.tfs.trim().split(/[\s\t\n\r\0,;|]+/);
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);

    // case search all regulations
    if (tfNames[0] === "" && geneNames[0] === "") {
        const regs = await getMegaAllRegulations(
            params.species,
            params.envconGroup,
            params.envconSubgroup
        );
        // const regs = await getAllRegulations(
        //     params.envconGroup,
        //     params.envconSubgroup,
        //     params.evidence,
        //     params.activator,
        //     params.inhibitor,
        //     params.noexprinfo,
        //     params.species
        // );
        return regs;
    }
    // case Search for Genes
    else if (geneNames[0] === "") {
        // const idList = tfNames.map((element) => getID(element));
        const idList = await getIDs(tfNames, params.species);

        // standard, no homologous relations
        if (params.homolog === undefined || params.homolog === "") {
            const regs = await getMegaRegulationsByTF(
                idList.join(", "),
                params.envconGroup,
                params.envconSubgroup
            );
            // const regs = await getRegulationsByTF(
            //     idList.join(", "),
            //     params.envconGroup,
            //     params.envconSubgroup,
            //     params.evidence,
            //     params.activator,
            //     params.inhibitor,
            //     params.noexprinfo
            // );
            return regs;

            // homologous relations
        } else {
            // prettier-ignore
            // NOT FINISHED - COMMENTED FOR NOW
            // const homoIds = await getHomoIDs(ids, params.species, params.homolog, params.synteny);
            // TODO
        }
    }
    // case Search for TFs
    else if (tfNames[0] === "") {
        const idList = await getIDs(geneNames, params.species);
        const regs = await getMegaRegulationsByGene(
            idList.join(", "),
            params.envconGroup,
            params.envconSubgroup
        );
        // const regs = await getRegulationsByGene(
        //     idList.join(", "),
        //     params.envconGroup,
        //     params.envconSubgroup,
        //     params.evidence,
        //     params.activator,
        //     params.inhibitor,
        //     params.noexprinfo
        // );
        return regs;
    }
    // case Search for Associations
    else {
        // const tfIdList = tfNames.map((element) => getID(element));
        const tfIdList = await getIDs(tfNames, params.species);
        // const geneIdList = geneNames.map((element) => getID(element));
        const geneIdList = await getIDs(geneNames, params.species);

        const regs = await getMegaRegulations(
            tfIdList.join(", "),
            geneIdList.join(", "),
            params.envconGroup,
            params.envconSubgroup
        );
        // const regs = await getRegulationsByTFAndGene(
        //     tfIdList.join(", "),
        //     geneIdList.join(", "),
        //     params.envconGroup,
        //     params.envconSubgroup,
        //     params.evidence,
        //     params.activator,
        //     params.inhibitor,
        //     params.noexprinfo
        // );
        return regs;
    }
}
export async function rankTF(params) {
    if (
        params.tfs === undefined ||
        params.genes === undefined ||
        // params.documented === undefined ||
        // params.activator === undefined ||
        // params.inhibitor === undefined ||
        // params.noexprinfo === undefined ||
        // params.envconGroup === undefined ||
        // params.envconSubgroup === undefined ||
        // params.synteny === undefined ||
        // params.homolog === undefined ||
        params.species === undefined
    ) {
        throw new Error("Bad Request");
    }

    const tfNames = params.tfs.trim().split(/[\s\t\n\r\0,;|]+/);
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);

    let geneIdList;
    let tfIdList;

    // all TFs
    if (tfNames[0] === "") {
        tfIdList = await getAllTFids(params.species);
        // geneIdList = geneNames.map((element) => getID(element));
        geneIdList = await getIDs(geneNames, params.species);
    }
    // input specified TFs
    else if (tfNames[0] !== "" && geneNames[0] !== "") {
        // tfIdList = tfNames.map((element) => getID(element));
        tfIdList = await getIDs(tfNames, params.species);
        // geneIdList = geneNames.map((element) => getID(element));
        geneIdList = await getIDs(geneNames, params.species);
    }
    // no genes -> no query
    else {
        throw new Error("No orf/genes provided");
    }

    const regs = await getRegulations(
        tfIdList.join(", "),
        geneIdList.join(", "),
        params.envconGroup,
        params.envconSubgroup,
        params.evidence,
        params.activator,
        params.inhibitor,
        params.noexprinfo
    );
    const ranks = await getRankByTfs(
        regs,
        tfIdList,
        params.species,
        geneIdList.length
    );
    return ranks;
}

async function getRankByTfs(regs, tfIDs, species, hypern) {
    let ranks = [];
    const hyperN = await getTotalNumDBGenes(species);
    for (let id of tfIDs) {
        const dbNum = await getAllGenesByTF(id);
        const idRegs = regs.filter((row) => row["tfid"] === id);
        const dbPer = Number.parseFloat((idRegs.length / dbNum) * 100).toFixed(
            2
        );

        if (idRegs.length > 0)
            ranks.push({
                tf: idRegs[0]["protein"],
                genes: idRegs.map((row) =>
                    row["gene"] === "Uncharacterized" ? row["orf"] : row["gene"]
                ),
                // setNum: idRegs.length,
                setPer: Number.parseFloat(
                    (idRegs.length / hypern) * 100
                ).toFixed(2),
                // dbNum: dbNum,
                dbPer: dbPer,
                pvalue: hypergeometric(hyperN, dbNum, hypern, idRegs.length),
            });
    }
    return ranks;
}

export async function rankGO(params) {
    if (params.genes === undefined || params.species === undefined) {
        throw new Error("Bad Request");
    }

    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);
    if (geneNames[0] === "") {
        throw new Error("No genes provided");
    }
    const geneIdList = await getIDs(geneNames, params.species);
    const hyperN = await getTotalNumDBGenes(params.species);
    if (hyperN === -1) throw new Error("Database Error");

    const gos = await getGOids(
        geneIdList,
        params.species,
        params.ontology,
        hyperN,
        geneIdList.length
    );
    return gos;
}

// export async function lmaoService(params) {
//     // req check

//     const tfNames = params.tfs.trim().split(/[\s\t\n\r\0,;|]+/);
//     const idList = await getIDs(tfNames, params.species);
//     const regs = await getMegaRegulationsByTF(idList);
//     return regs;
// }
