import {
    getRegulations,
    getRegulationsByTF,
    getRegulationsByGene,
    getRegulationsByTFAndGene,
    getAllRegulations,
    getAllGenesByTF,
    getIDs,
    getGOids,
    getHomoIDs,
} from "../db/repository.js";

export async function searchRegulations(params) {
    if (
        params.tfs === undefined ||
        params.genes === undefined ||
        params.documented === undefined ||
        params.activator === undefined ||
        params.inhibitor === undefined ||
        params.noexprinfo === undefined ||
        params.envconGroup === undefined ||
        params.envconSubgroup === undefined ||
        params.synteny === undefined ||
        params.species === undefined
    ) {
        // res.status(400).send("Bad Request");
        throw new Error("Bad Request");
    }

    const tfNames = params.tfs.trim().split(/[\s\t\n\r\0,;|]+/);
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);

    // case search all regulations
    if (tfNames[0] === "" && geneNames[0] === "") {
        const regs = await getAllRegulations(
            params.envconGroup,
            params.envconSubgroup,
            params.evidence,
            params.activator,
            params.inhibitor,
            params.noexprinfo,
            params.species
        );
        return regs;
    }
    // case Search for Genes
    else if (geneNames[0] === "") {
        // const idList = tfNames.map((element) => getID(element));
        const idList = await getIDs(tfNames, params.species);
        // Promise.all(idList)
        //     .then((values) =>
        //         getRegulationsByTF(
        //             values.join(", "),
        //             params.envconGroup,
        //             params.envconSubgroup,
        //             params.evidence,
        //             params.activator,
        //             params.inhibitor,
        //             params.noexprinfo
        //         )
        //     )
        //     .then((values) => res.status(200).json(values));

        // standard, no homologous relations
        if (params.homolog === undefined || params.homolog === "") {
            const regs = await getRegulationsByTF(
                idList.join(", "),
                params.envconGroup,
                params.envconSubgroup,
                params.evidence,
                params.activator,
                params.inhibitor,
                params.noexprinfo
            );
            return regs;

            // homologous relations
        } else {
            // prettier-ignore
            const homoIds = await getHomoIDs(ids, params.species, params.homolog, params.synteny);
            // TODO
        }
    }
    // case Search for TFs
    else if (tfNames[0] === "") {
        // const idList = geneNames.map((element) => getID(element));
        const idList = await getIDs(geneNames, params.species);
        // Promise.all(idList)
        //     .then((values) =>
        //         getRegulationsByGene(
        //             values.join(", "),
        //             params.envconGroup,
        //             params.envconSubgroup,
        //             params.evidence,
        //             params.activator,
        //             params.inhibitor,
        //             params.noexprinfo
        //         )
        //     )
        //     .then((values) => res.status(200).json(values));
        const regs = await getRegulationsByGene(
            idList.join(", "),
            params.envconGroup,
            params.envconSubgroup,
            params.evidence,
            params.activator,
            params.inhibitor,
            params.noexprinfo
        );
        return regs;
    }
    // case Search for Associations
    else {
        // const tfIdList = tfNames.map((element) => getID(element));
        const tfIdList = await getIDs(tfNames, params.species);
        // const geneIdList = geneNames.map((element) => getID(element));
        const geneIdList = await getIDs(geneNames, params.species);
        // Promise.all([tfIdList, geneIdList].map((idLst) => Promise.all(idLst)))
        //     .then((values) =>
        //         getRegulations(
        //             values[0].join(", "),
        //             values[1].join(", "),
        //             params.envconGroup,
        //             params.envconSubgroup,
        //             params.evidence,
        //             params.activator,
        //             params.inhibitor,
        //             params.noexprinfo
        //         )
        //     )
        //     .then((values) => trimReturnObject(values))
        //     .then((values) => res.status(200).json(values));
        const regs = await getRegulationsByTFAndGene(
            tfIdList.join(", "),
            geneIdList.join(", "),
            params.envconGroup,
            params.envconSubgroup,
            params.evidence,
            params.activator,
            params.inhibitor,
            params.noexprinfo
        );
        return regs;
    }
}
export async function rankTF(params) {
    if (
        params.tfs === undefined ||
        params.genes === undefined ||
        params.documented === undefined ||
        params.activator === undefined ||
        params.inhibitor === undefined ||
        params.noexprinfo === undefined ||
        params.envconGroup === undefined ||
        params.envconSubgroup === undefined ||
        params.synteny === undefined ||
        params.homolog === undefined ||
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
        // TODO GET ALL TFS
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
        // res.status(400).send("Bad Request - no valid orf/genes specified");
        // return;
        throw new Error("No orf/genes provided");
    }

    // Promise.all([tfIdList, geneIdList].map((idLst) => Promise.all(idLst)))
    //     .then((values) =>
    //         Promise.all([
    //             getRegulations(
    //                 values[0].join(", "),
    //                 values[1].join(", "),
    //                 params.envconGroup,
    //                 params.envconSubgroup,
    //                 params.evidence,
    //                 params.activator,
    //                 params.inhibitor,
    //                 params.noexprinfo
    //             ),
    //             values[0],
    //             values[1],
    //         ])
    //     )
    //     .then((values) =>
    //         Promise.all(getRankByTfs(values[0], values[1], values[2].length))
    //     )
    //     .then((values) => res.status(200).json(values));
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
    const ranks = await getRankByTfs(regs, tfIdList, geneIdList.length);
    return ranks;
}

async function getRankByTfs(regs, tfIDs, hypern) {
    let ranks = [];
    for (let id of tfIDs) {
        const dbNum = await getAllGenesByTF(id);

        const idRegs = regs.filter((row) => row["tfid"] === id);
        const dbPer = idRegs.length / (await dbNum);

        ranks.push({
            tf: idRegs[0]["protein"],
            genes: idRegs.map((row) =>
                row["gene"] === "Uncharacterized" ? row["orf"] : row["gene"]
            ),
            // setNum: idRegs.length,
            setPer: idRegs.length / hypern,
            // dbNum: dbNum,
            dbPer: dbPer,
        });
    }
    return ranks;
}

export async function rankGO(params) {
    if (params.genes === undefined || params.species === undefined) {
        throw new Error("Bad Request");
    }

    // const hypern = getTotalNumDBGenes("Saccharomyces cerevisiae S288c");
    const geneNames = params.genes.trim().split(/[\s\t\n\r\0,;|]+/);
    if (geneNames[0] === "") {
        // res.status(400).send("Bad Request - no valid genes specified");
        // return;
        throw new Error("No genes provided");
    }
    const geneIdList = await getIDs(geneNames, params.species);
    // Promise.all(geneIdList)
    //     .then(async (ids) => {
    //         const res = await getGOids(ids, params.ontology);
    //         return Promise.all(res);
    //     })
    //     .then((values) => res.status(200).json(values));
    const gos = await getGOids(geneIdList, params.ontology);
    return gos;
}
