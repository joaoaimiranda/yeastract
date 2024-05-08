import { query, querySingleRow, querySingleValue } from "./dbaccess.js";

export async function getIDs(names, species) {
    let res = [];
    for (n of names) {
        const id = await getID(n, species);
        res.push(id);
    }
    return res;
}

export async function getAllIDs(species) {
    const q = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and O.species in ('${species}')`;

    const res = await query(q);
    return res.map((row) => row["orfid"]);
}

export async function getID(element, species) {
    const q_orf = `select O.orfid from orfgene as O LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='${element}' or O.gene='${element}') and O.species in ('${species}');`;

    const q_alias = `select O.orfid from orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid and A.alias='${element}' and O.species in ('${species}');`;

    const q_prot = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${element}' and O.species in ('${species}');`;

    const res_orf = await querySingleValue(q_orf);
    if (res_orf !== null) return res_orf;
    else {
        const res_alias = await querySingleValue(q_alias);
        if (res_alias !== null) return res_alias;
        else {
            const res_prot = await querySingleValue(q_prot);
            if (res_prot !== null) return res_prot;
        }
    }
    return -1;
}
// prettier-ignore
export async function getRegulationsByTF(ids, biggroup, subgroup, evidence, pos, neg, NA) {
    const q =
        "select distinct O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        ` where R.tfid in (${ids})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    const res = await query(q);
    return res.map((row) => {
        if (row["gene"] === "Uncharacterized") row["gene"] = row["orf"];
        return { gene: row["gene"], tf: row["protein"] };
    });
}
// prettier-ignore
export async function getRegulationsByGene(ids, biggroup, subgroup, evidence, pos, neg, NA) {
    const q =
        "select distinct P.protein, O.orf, O.gene from regulation as R " +
        "left outer join protein as P on R.tfid=P.tfid left outer join orfgene as O on R.targetid=O.orfid " +
        `where R.targetid in (${ids})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    let res = await query(q);
    return res.map((row) => {
        if (row["gene"] !== row["orf"])
            row["orf"] = [row["orf"], row["gene"]].join("/");
        return { gene: row["orf"], tf: row["protein"] };
    });
}
// prettier-ignore
export async function getRegulationsByTFAndGene(tfIds, geneIds, biggroup, subgroup, evidence, pos, neg, NA) {
    // prettier-ignore
    const regs = await getRegulations(tfIds, geneIds, biggroup, subgroup, evidence, pos, neg, NA);
    return regs.map((row) => {
        if (row["gene"] === "Uncharacterized") row["gene"] = row["orf"];
        return { gene: row["gene"], tf: row["protein"] };
    });
}
// prettier-ignore
export async function getRegulations(tfIds, geneIds, biggroup, subgroup, evidence, pos, neg, NA) {
    const q =
        "select distinct R.tfid, O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        ` where R.targetid in (${geneIds}) and R.tfid in (${tfIds})` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);

    const res = await query(q);
    return res;
}

// export async function getAllRegulations(biggroup, subgroup, evidence, pos, neg, NA) {

//     const envconQuery = getEnvconQuery(biggroup, subgroup, false);
//     const evidenceQuery = getEvidenceQuery(evidence, pos, neg, NA, false);

//     let q = "select distinct R.tfid, O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
//         " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid";
//     if (envconQuery !== "" && evidenceQuery !== "") q += ` where ${envconQuery} and ${evidenceQuery}`;
//     else if (envconQuery !== "") q += ` where ${envconQuery}`;
//     else if (evidenceQuery !== "") q += ` where ${evidenceQuery}`;

//     const res = await query(q);
//     return res;
// }

function getEnvconQuery(biggroup, subgroup, and = true) {
    if (!biggroup) return "";
    const subgroupQ = subgroup ? ` and subgroup='${subgroup}'` : "";
    return (
        `${and ? " and " : ""}` +
        "R.regulationid in (select distinct regulationid from regulationdata " +
        "where envconditionid in (select envconditionid from envcondition where " +
        "groupid in (select groupid from envconditiongroups where " +
        `biggroup='${biggroup}'` +
        subgroupQ +
        ")))"
    );
}

function getEvidenceQuery(evidence, pos, neg, NA, and = true) {
    if (!evidence || (evidence !== "binding" && !pos && !neg && !NA)) return "";
    let q =
        `${and ? " and " : ""}` +
        "R.regulationid in (select distinct regulationid from regulationdata " +
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

export async function getAllGenesByTF(id) {
    const q =
        "select count(distinct R.targetid) as numGenes from " +
        `regulation as R where R.tfid='${id}'`;
    const res = await querySingleValue(q);
    if (res === null) return -1;
    return res;
}

export async function getTotalNumDBGenes(species) {
    const q = `select count(orf) as gTotal from orfgene where species='${species}'`;
    const res = await querySingleValue(q);
    if (res === null) return -1;
    return res;
}

export async function getGOids(geneIds, ontology) {
    // prettier-ignore
    const q =
        "select G.goid, orfid from goorflist as T, geneontology as G " +
        `where orfid in (${geneIds.join(", ")}) and G.goid=T.goid and G.onto='${ontology}'`;
    const res = await query(q);
    let terms = [];
    // res.forEach((row) => {
    //     terms.some((element) => element["goid"] === row["goid"])
    //         ? terms[
    //               terms.findIndex((element) => element["goid"] === row["goid"])
    //           ]["genes"].push(row["orfid"])
    //         : terms.push({ goid: row["goid"], genes: [row["orfid"]] });
    // });
    for (row of res) {
        terms.some((element) => element["goid"] === row["goid"])
            ? terms[
                  terms.findIndex((element) => element["goid"] === row["goid"])
              ]["genes"].push(row["orfid"])
            : terms.push({ goid: row["goid"], genes: [row["orfid"]] });
    }
    // return terms.map(async (row) => {
    //     const q2 =
    //         "select count(distinct orfid) as assoc from goorflist where " +
    //         `goid='${row["goid"]}' and orfid in (select distinct orfid from orfgene ` +
    //         "where species in ('Saccharomyces cerevisiae S288c'))" +
    //         ` and goid in (select distinct goid from geneontology where onto='${ontology}')`;
    //     const res2 = await query(q2);
    //     const q3 = `select term, depth from geneontology where goid='${row["goid"]}' and onto='${ontology}'`;
    //     const res3 = await query(q3);
    //     // TODO MISSING HYPERN
    //     return {
    //         goid: row["goid"],
    //         genes: row["genes"],
    //         setPer: row["genes"].length / geneIds.length,
    //         dbPer: res2[0][0]["assoc"] / 1,
    //         term: res3[0][0]["term"],
    //         depth: res3[0][0]["depth"],
    //     };
    // });
    let gos = [];
    for (row of terms) {
        const q_count =
            "select count(distinct orfid) as assoc from goorflist where " +
            `goid='${row["goid"]}' and orfid in (select distinct orfid from orfgene ` +
            "where species in ('Saccharomyces cerevisiae S288c'))" +
            ` and goid in (select distinct goid from geneontology where onto='${ontology}')`;
        const q_ontology = `select term, depth from geneontology where goid='${row["goid"]}' and onto='${ontology}'`;

        const res_count = await querySingleValue(q_count);
        const res_ontology = await querySingleRow(q_ontology);
        // TODO MISSING HYPERN
        gos.push({
            goid: row["goid"],
            genes: row["genes"],
            setPer: row["genes"].length / geneIds.length,
            dbPer: res_count / 1, // FIX THIS 1 (?) probably same as hypern comment
            term: res_ontology["term"],
            depth: res_ontology["depth"],
        });
    }
    return gos;
}

export async function upstreamSequence(ids) {
    const q = `select orfid,promoterseq from orfgene where orfid in (${ids})`;
    const res = await query(q);
    return res;
}

export async function getMotifsFromDB(
    bsrgOnly = true,
    species = "Saccharomyces cerevisiae S288c"
) {
    // FIXME SPECIES HARDCODED
    const q =
        "select distinct P.tfid, P.protein, C.IUPACseq from protein as P, " +
        "consensus as C, tfconsensus as TFC, orfgene as O where " +
        "C.consensusid=TFC.consensusid and TFC.tfid=P.tfid and " +
        `P.tfid=O.orfid and O.species='${species}'` +
        " and TFC.source='BSRG curated'";

    const res = await query(q);
    let ret = [];
    for (const row of res) {
        if (ret.some((element) => element["seq"] === row["IUPACseq"])) {
            ret.find((element) => element["seq"] === row["IUPACseq"])[
                "tfs"
            ].push(row["protein"]);
        } else {
            ret.push({ tfs: [row["protein"]], seq: row["IUPACseq"] });
        }
    }
    return ret;
}

// FIXME GENE VS PROT STRING
export async function multiSearch(
    term,
    species = "Saccharomyces cerevisiae S288c"
) {
    const q_orf = `select orfid from orfgene where orf='${term}' and species='${species}'`;
    const q_gene = `select orfid from orfgene where gene='${term}' and species='${species}'`;
    const q_alias = `select O.orfid from orfgene as O, alias as A where A.alias='${term}' and A.orfid=O.orfid and O.species='${species}'`;
    const q_prot = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${term}' and O.species='${species}'`;

    // return Promise.any([
    //     querySingleValue(q1),
    //     querySingleValue(q2),
    //     querySingleValue(q3),
    //     querySingleValue(q4),
    // ])
    //     .then((value) => {
    //         if (value.length !== 0) return value;
    //         return -1;
    //     })
    //     .catch((err) => {
    //         if (err.message !== "All promises were rejected")
    //             throw new Error("Database Error");
    //         else return -1;
    //     });
    const res_orf = await querySingleValue(q_orf);
    if (res_orf !== null) return res_orf;
    else {
        const res_gene = await querySingleValue(q_gene);
        if (res_gene !== null) return res_gene;
        else {
            const res_alias = await querySingleValue(q_alias);
            if (res_alias !== null) return res_alias;
            else {
                const res_prot = await querySingleValue(q_prot);
                if (res_prot !== null) return res_prot;
            }
        }
    }
    return -1;
}

export async function getORFinfo(orfid) {
    const q_orf = `select * from orfgene where orfid=${orfid}`;
    const q_protein = `select protein from protein where tfid='${orfid}'`;
    const q_desc =
        `select D.description from orfgene as O, description as D ` +
        `where D.descriptionid=O.descriptionid and O.orfid='${orfid}'`;
    const q_alias = `select alias from alias where orfid='${orfid}'`;

    const orf = await querySingleRow(q_orf);
    const prot = await querySingleValue(q_protein);
    const desc = await querySingleValue(q_desc);
    const alias_res = await query(q_alias);

    // const orf = orf_res[0];
    let allele = "";
    if (orf["alleleid"] !== null) {
        const q_allele = `select orf as allele from orfgene where orfid='${orf["allele"]}'`;
        allele = await querySingleValue(q_allele);
        // allele = allele_res[0]["allele"];
    }
    // const prot = prot_res[0];
    // const desc = desc_res[0];

    const ret = {};
    ret["orfname"] = orf["orf"];
    ret["genename"] = orf["gene"];
    ret["promotersequence"] = orf["promoterseq"];
    ret["genesequence"] = orf["geneseq"];
    ret["coords"] = orf["coords"];
    const extIndex = orf["gdid"].indexOf(":");
    ret["ext"] =
        extIndex !== -1 ? orf["gdid"].substring(extIndex + 1) : orf["gdid"];
    // FIXME RE-WRITE FOR STRAIN INSTEAD OF SPECIES
    ret["strain"] = orf["species"];
    // ret["proteinname"] = prot["protein"];
    ret["proteinname"] = prot;
    // ret["description"] = desc["description"];
    ret["description"] = desc;
    ret["altname"] = alias_res.map((row) => row["alias"]).join(", ");
    ret["allele"] = allele;

    return ret;
}

export async function getPossibleMatches(
    term,
    species = "Saccharomyces cerevisiae S288c"
) {
    const q_orf = `select orf, gene from orfgene where orf like '%${term}%' and species='${species}'`;
    const q_gene = `select orf, gene from orfgene where gene like '%${term}%' and species='${species}'`;
    const q_alias = `select A.alias, O.orf, O.gene from orfgene as O, alias as A where A.alias like '%${term}%' and A.orfid=O.orfid and species='${species}'`;
    const q_protein = `select P.protein from protein as P, orfgene as O where P.protein like '%${term}%' and P.tfid=O.orfid and species='${species}'`;
    const q_desc = `select distinct D.description, O.orf, O.gene from description as D, orfgene as O where D.description like '%${term}%' and D.descriptionid=O.descriptionid and O.species='${species}'`;
    const q_func = `select distinct term from geneontology where onto='function' and term like '%${term}%'`;
    const q_process = `select distinct term from geneontology where onto='process' and term like '%${term}%'`;
    const q_component = `select distinct term from geneontology where onto='component' and term like '%${term}%'`;
    const q_reactionname =
        `select reactionname from mreaction where reactionname like '%${term}` +
        `%' and modid in (select modid from mmodel where species='${species}')`;
    const q_reactionstr =
        `select reactionstr from mreaction where reactionstr like '%${term}` +
        `%' and modid in (select modid from mmodel where species='${species}')`;

    const orf_res = await query(q_orf);
    const gene_res = await query(q_gene);
    const alias_res = await query(q_alias);
    const protein_res = await query(q_protein);
    const description_res = await query(q_desc);
    const func_res = await query(q_func);
    const process_res = await query(q_process);
    const component_res = await query(q_component);
    const reactionname_res = await query(q_reactionname);
    const reactionstr_res = await query(q_reactionstr);

    return {
        orf: orf_res,
        gene: gene_res,
        alias: alias_res,
        protein: protein_res.map((row) => row["protein"]),
        description: description_res,
        func: func_res.map((row) => row["term"]),
        process: process_res.map((row) => row["term"]),
        component: component_res.map((row) => row["term"]),
        reactionname: reactionname_res.map((row) => row["reactionname"]),
        reactionstr: reactionstr_res.map((row) => row["reaction_str"]),
    };
}
