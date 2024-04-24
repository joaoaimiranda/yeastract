const dbaccess = require("../db/dbaccess");
var express = require("express");
var router = express.Router();

router.post("/search", searchRegulations);
router.post("/ranktf", rankTF);
router.post("/rankgo", rankGO);

function searchRegulations(req, res, next) {
    params = req.body;
    if (
        params.query === undefined ||
        params.tfs === undefined ||
        params.genes === undefined ||
        params.evidence === undefined ||
        params.documented === undefined ||
        params.activator === undefined ||
        params.inhibitor === undefined ||
        params.noexprinfo === undefined ||
        params.envconGroup === undefined ||
        params.envconSubgroup === undefined ||
        params.synteny === undefined ||
        params.homolog === undefined
    ) {
        res.status(400).send("Bad Request");
    }

    const tfNames = params.tfs.split(/[\s\t\n\r\0,;|]+/);
    const geneNames = params.genes.split(/[\s\t\n\r\0,;|]+/);

    // case search all regulations
    if (tfNames[0] === "" && geneNames[0] === "") {
        //getAllRegulations
    }
    // case Search for Genes
    else if (geneNames[0] === "") {
        const idList = tfNames.map((element) => getID(element));
        Promise.all(idList)
            .then((values) =>
                getRegulationsByTF(
                    values.join(", "),
                    params.envconGroup,
                    params.envconSubgroup,
                    params.evidence,
                    params.activator,
                    params.inhibitor,
                    params.noexprinfo
                )
            )
            .then((values) => res.status(200).json(values));
    }
    // case Search for TFs
    else if (tfNames[0] === "") {
        const idList = geneNames.map((element) => getID(element));
        Promise.all(idList)
            .then((values) =>
                getRegulationsByGene(
                    values.join(", "),
                    params.envconGroup,
                    params.envconSubgroup,
                    params.evidence,
                    params.activator,
                    params.inhibitor,
                    params.noexprinfo
                )
            )
            .then((values) => res.status(200).json(values));
    }
    // case Search for Associations
    else {
        const tfIdList = tfNames.map((element) => getID(element));
        const geneIdList = geneNames.map((element) => getID(element));
        Promise.all([tfIdList, geneIdList].map((idLst) => Promise.all(idLst)))
            .then((values) =>
                getRegulations(
                    values[0].join(", "),
                    values[1].join(", "),
                    params.envconGroup,
                    params.envconSubgroup,
                    params.evidence,
                    params.activator,
                    params.inhibitor,
                    params.noexprinfo
                )
            )
            .then((values) => trimReturnObject(values))
            .then((values) => res.status(200).json(values));
    }
}

function rankTF(req, res, next) {
    params = req.body;
    if (
        params.query === undefined ||
        params.tfs === undefined ||
        params.genes === undefined ||
        params.evidence === undefined ||
        params.documented === undefined ||
        params.activator === undefined ||
        params.inhibitor === undefined ||
        params.noexprinfo === undefined ||
        params.envconGroup === undefined ||
        params.envconSubgroup === undefined ||
        params.synteny === undefined ||
        params.homolog === undefined
    ) {
        res.status(400).send("Bad Request");
    }

    const tfNames = params.tfs.split(/[\s\t\n\r\0,;|]+/);
    const geneNames = params.genes.split(/[\s\t\n\r\0,;|]+/);

    let geneIdList;
    let tfIdList;

    // all TFs
    if (tfNames[0] === "") {
        // TODO GET ALL TFS
        geneIdList = geneNames.map((element) => getID(element));
    }
    // input specified TFs
    else if (tfNames[0] !== "" && geneNames[0] !== "") {
        tfIdList = tfNames.map((element) => getID(element));
        geneIdList = geneNames.map((element) => getID(element));
    }
    // no genes -> no query
    else {
        res.status(400).send("Bad Request - no valid orf/genes specified");
        return;
    }

    Promise.all([tfIdList, geneIdList].map((idLst) => Promise.all(idLst)))
        .then((values) =>
            Promise.all([
                getRegulations(
                    values[0].join(", "),
                    values[1].join(", "),
                    params.envconGroup,
                    params.envconSubgroup,
                    params.evidence,
                    params.activator,
                    params.inhibitor,
                    params.noexprinfo
                ),
                values[0],
                values[1],
            ])
        )
        .then((values) =>
            Promise.all(getRankByTfs(values[0], values[1], values[2].length))
        )
        .then((values) => res.status(200).json(values));
}

function rankGO(req, res, next) {
    params = req.body;
    if (params.genes === undefined || params.ontology === undefined) {
        res.status(400).send("Bad Request");
    }

    // const hypern = getTotalNumDBGenes("Saccharomyces cerevisiae S288c");
    const geneNames = params.genes.split(/[\s\t\n\r\0,;|]+/);
    if (geneNames[0] === "") {
        res.status(400).send("Bad Request - no valid genes specified");
        return;
    }
    geneIdList = geneNames.map((element) => getID(element));
    Promise.all(geneIdList)
        .then(async (ids) => {
            const res = await getGOids(ids, params.ontology);
            return Promise.all(res);
        })
        .then((values) => res.status(200).json(values));
}

async function getID(element) {
    const q1 = `select O.orfid from orfgene as O LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='${element}' or O.gene='${element}') and O.species in ('Saccharomyces cerevisiae S288c');`;

    const q2 = `select O.orfid from orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid and A.alias='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

    const q3 = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

    return Promise.any([
        dbaccess.query(q1),
        dbaccess.query(q2),
        dbaccess.query(q3),
    ]).then((value) => {
        if (value[0][0]["orfid"] !== undefined) return value[0][0]["orfid"];
        else throw new Error("Database query error");
    });
}

async function getRegulationsByTF(
    ids,
    biggroup,
    subgroup,
    evidence,
    pos,
    neg,
    NA
) {
    const q =
        "select distinct O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        ` where R.tfid in (${ids})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    let res = await dbaccess.query(q);
    return res[0].map((row) => {
        if (row["gene"] === "Uncharacterized") row["gene"] = row["orf"];
        return { gene: row["gene"], tf: row["protein"] };
    });
}

async function getRegulationsByGene(
    ids,
    biggroup,
    subgroup,
    evidence,
    pos,
    neg,
    NA
) {
    const q =
        "select distinct P.protein, O.orf, O.gene from regulation as R " +
        "left outer join protein as P on R.tfid=P.tfid left outer join orfgene as O on R.targetid=O.orfid " +
        `where R.targetid in (${ids})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    let res = await dbaccess.query(q);
    return res[0].map((row) => {
        if (row["gene"] !== row["orf"])
            row["orf"] = [row["orf"], row["gene"]].join("/");
        return { gene: row["orf"], tf: row["protein"] };
    });
}

async function getRegulations(
    tfIds,
    geneIds,
    biggroup,
    subgroup,
    evidence,
    pos,
    neg,
    NA
) {
    const q =
        "select distinct R.tfid, O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        ` where R.targetid in (${geneIds}) and R.tfid in (${tfIds})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    let res = await dbaccess.query(q);
    return res[0];
}

function getEnvconQuery(biggroup, subgroup) {
    if (!biggroup) return "";
    const subgroupQ = subgroup ? ` and subgroup='${subgroup}'` : "";
    return (
        " and R.regulationid in (select distinct regulationid from regulationdata " +
        "where envconditionid in (select envconditionid from envcondition where " +
        "groupid in (select groupid from envconditiongroups where " +
        `biggroup='${biggroup}'` +
        subgroupQ +
        ")))"
    );
}

function getEvidenceQuery(evidence, pos, neg, NA) {
    if (!evidence || (evidence !== "binding" && !pos && !neg && !NA)) return "";
    let q =
        " and R.regulationid in (select distinct regulationid from regulationdata " +
        "where evidencecodeid in (select evidencecodeid from evidencecodeBSRG where ";
    if (evidence === "binding") q += "code='Direct'))";
    else if (evidence === "expression") q += "code='Indirect'))";
    else if (evidence === "binding and expression")
        q +=
            "code='Direct')) " +
            q +
            "code='Indirect')" +
            getAssocTypeQuery(pos, neg, NA) +
            ")";
    else if (evidence === "binding or expression")
        q +=
            "code='Direct' or code='Indirect')" +
            getAssocTypeQuery(pos, neg, NA) +
            ")";
    else return "";
    return q;
}

function getAssocTypeQuery(pos, neg, NA) {
    if (pos && !neg && !NA) return " and association like 'Positive%'";
    if (pos && !neg && NA)
        return " and (association like 'Positive%' or association like 'N/A')";
    if (pos && neg && !NA)
        return " and (association like 'Positive%' or association like '%Negative')";
    if (pos && neg && NA)
        return " and (association like 'Positive%' or association like '%Negative' or association like 'N/A')";
    if (!pos && neg && !NA) return " and association like '%Negative'";
    if (!pos && neg && NA)
        return " and (association like '%Negative' or association like 'N/A')";
    return "";
}

function trimReturnObject(regs) {
    return regs.map((row) => {
        if (row["gene"] === "Uncharacterized") row["gene"] = row["orf"];
        return { gene: row["gene"], tf: row["protein"] };
    });
}

function getRankByTfs(regs, tfIDs, hypern) {
    return tfIDs.map(async (id) => {
        const dbNum = await getAllGenesByTF(id);

        const idRegs = regs.filter((row) => row["tfid"] === id);
        const dbPer = idRegs.length / (await dbNum);

        return {
            tf: idRegs[0]["protein"],
            genes: idRegs.map((row) =>
                row["gene"] === "Uncharacterized" ? row["orf"] : row["gene"]
            ),
            // setNum: idRegs.length,
            setPer: idRegs.length / hypern,
            // dbNum: dbNum,
            dbPer: dbPer,
        };
    });
}

async function getAllGenesByTF(id) {
    const q =
        "select count(distinct R.targetid) as numGenes from " +
        "regulation as R where R.tfid='" +
        id +
        "'";
    const res = await dbaccess.query(q);
    return res[0][0]["numGenes"];
}

async function getTotalNumDBGenes(species) {
    const q = `select count(orf) as gTotal from orfgene where species='${species}'`;
    const res = await dbaccess.query(q);
    return res[0][0]["gTotal"];
}

async function getGOids(geneIds, ontology) {
    const q =
        "select G.goid, orfid from goorflist as T, geneontology as G " +
        `where orfid in (${geneIds}) and G.goid=T.goid and G.onto='${ontology}'`;
    const res = await dbaccess.query(q);
    let terms = [];
    res[0].forEach((row) => {
        terms.some((element) => element["goid"] === row["goid"])
            ? terms[
                  terms.findIndex((element) => element["goid"] === row["goid"])
              ]["genes"].push(row["orfid"])
            : terms.push({ goid: row["goid"], genes: [row["orfid"]] });
    });
    return terms.map(async (row) => {
        const q2 =
            "select count(distinct orfid) as assoc from goorflist where " +
            `goid='${row["goid"]}' and orfid in (select distinct orfid from orfgene ` +
            "where species in ('Saccharomyces cerevisiae S288c'))" +
            ` and goid in (select distinct goid from geneontology where onto='${ontology}')`;
        const res2 = await dbaccess.query(q2);
        const q3 = `select term, depth from geneontology where goid='${row["goid"]}' and onto='${ontology}'`;
        const res3 = await dbaccess.query(q3);
        // TODO MISSING HYPERN
        return {
            goid: row["goid"],
            genes: row["genes"],
            setPer: row["genes"].length / geneIds.length,
            dbPer: res2[0][0]["assoc"] / 1,
            term: res3[0][0]["term"],
            depth: res3[0][0]["depth"],
        };
    });
}

module.exports = router;
