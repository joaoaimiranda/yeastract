import {
    query,
    querySingleCol,
    querySingleRow,
    querySingleValue,
} from "./dbaccess.js";
import speciesList from "./speciesList.js";

function dbspecies(key) {
    if (speciesList[key] === undefined) throw new Error("Species not found");
    let res = [];
    for (let strain of speciesList[key].dbstrains) {
        res.push(speciesList[key].dbspecies + " " + strain);
    }
    return res.join("','");
}

export async function getIDs(names, species) {
    let res = [];
    for (let n of names) {
        const id = await getID(n, species);
        res.push(id);
    }
    return res;
}

export async function getAllIDs(species) {
    const q = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and O.species in ('${dbspecies(
        species
    )}')`;

    const res = await query(q);
    return res.map((row) => row["orfid"]);
}

export async function getID(element, species) {
    const q_orf = `select O.orfid from orfgene as O LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='${element}' or O.gene='${element}') and O.species in ('${dbspecies(
        species
    )}');`;

    const q_alias = `select O.orfid from orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid and A.alias='${element}' and O.species in ('${dbspecies(
        species
    )}');`;

    const q_prot = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${element}' and O.species in ('${dbspecies(
        species
    )}');`;

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

export async function getHomoIDs(
    ids,
    currentSpecies,
    homoSpecies,
    synteny,
    reverse = false
) {
    const species = reverse ? homoSpecies : currentSpecies;
    const q =
        "select O.orfid,O.orf,O.gene,P.protein, H.orfiddest, " +
        "Homo.orf as homoorf,Homo.gene as homogene from orfgene as O, " +
        "protein as P, orthologs as H left join orfgene as Homo on " +
        `H.orfiddest=Homo.orfid where O.orfid in (${ids}) ` +
        `and P.tfid=O.orfid and H.classif=${synteny} ` +
        "and O.orfid=H.orfidsrc and H.orfiddest in (select distinct " +
        `orfid from orfgene where species in ('${dbspecies(species)}'))`;
    const res = await query(q);
    console.log(res);
    return res;
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
export async function getMegaRegulationsByTF(ids, biggroup, subgroup) {
    // const q =
    //     "select distinct R.regulationid, O.gene, O.orf, P.protein, D.association, E.code, G.biggroup, G.subgroup" +
    //     " from regulation as R left outer join orfgene as O" +
    //     " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
    //     " left outer join regulationdata as D on R.regulationid=D.regulationid" +
    //     " left outer join evidencecodeBSRG as E on D.evidencecodeid=E.evidencecodeid" +
    //     " left outer join envcondition as C on D.envconditionid=C.envconditionid" +
    //     " left outer join envconditiongroups as G on C.groupid=G.groupid" +
    //     ` where R.tfid in (${ids})`;

    // const res = await query(q);
    const q =
        "select R.regulationid, O.gene, O.orf, P.protein, D.association, E.code" +
        " from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        " left outer join regulationdata as D on R.regulationid=D.regulationid" +
        " left outer join evidencecodeBSRG as E on D.evidencecodeid=E.evidencecodeid" +
        ` where R.tfid in (${ids})` +
        getEnvconQuery(biggroup, subgroup);
    const regs = await query(q);

    const xd = formatRegulations(regs);
    return Object.keys(xd).map((id) => xd[id]);
    // for (let row of regs) {
    //     const [assoc, evids, ecids] = await getRegData(row["regulationid"]);
    //     const ev = await getEVcodes(evids);
    //     // const [ecgroup, envcon] = await getECgroups(ecids);
    //     res.push({
    //         gene: row["gene"],
    //         orf: row["orf"],
    //         tf: row["protein"],
    //         association: assoc,
    //         evidence: ev,
    //         // envcon: envcon,
    //         // ecgroup: ecgroup,
    //     });
    // }
    // return res;
}

export async function getMegaRegulationsByGene(ids, biggroup, subgroup) {
    const q =
        "select R.regulationid, O.gene, O.orf, P.protein, D.association, E.code" +
        " from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        " left outer join regulationdata as D on R.regulationid=D.regulationid" +
        " left outer join evidencecodeBSRG as E on D.evidencecodeid=E.evidencecodeid" +
        ` where R.targetid in (${ids})` +
        getEnvconQuery(biggroup, subgroup);

    const regs = await query(q);
    const xd = formatRegulations(regs);
    return Object.keys(xd).map((id) => xd[id]);
}

export async function getMegaRegulations(tfIds, geneIds, biggroup, subgroup) {
    const q =
        "select R.regulationid, O.gene, O.orf, P.protein, D.association, E.code" +
        " from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        " left outer join regulationdata as D on R.regulationid=D.regulationid" +
        " left outer join evidencecodeBSRG as E on D.evidencecodeid=E.evidencecodeid" +
        ` where R.targetid in (${geneIds}) and R.tfid in (${tfIds})` +
        getEnvconQuery(biggroup, subgroup);

    const regs = await query(q);
    const xd = formatRegulations(regs);
    return Object.keys(xd).map((id) => xd[id]);
}

function formatRegulations(regs) {
    const xd = {};
    for (let row of regs) {
        const obj = xd[row["regulationid"]];
        if (obj !== undefined) {
            if (
                (obj["association"] === "Negative" &&
                    row["association"] === "Positive") ||
                (obj["association"] === "Positive" &&
                    row["association"] === "Negative")
            ) {
                obj["association"] = "Dual";
            } else if (obj["association"] === "N/A")
                obj["association"] = row["association"];

            if (
                (obj["evidence"] === "Binding" && row["code"] === "Indirect") ||
                (obj["evidence"] === "Expression" && row["code"] === "Direct")
            )
                obj["evidence"] = "Binding & Expression";
            else if (obj["evidence"] === "N/A") obj["evidence"] = row["code"];
        } else {
            let ev = "";
            if (row["code"] === "Direct") ev = "Binding";
            else if (row["code"] === "Indirect") ev = "Expression";
            else ev = "N/A";
            xd[row["regulationid"]] = {
                gene: row["gene"],
                orf: row["orf"],
                tf: row["protein"],
                association: row["association"],
                evidence: ev,
            };
        }
    }
    return xd;
}

async function getRegData(id) {
    const q =
        "select association, evidencecodeid, envconditionid " +
        `from regulationdata where regulationid=${id}`;
    const res = await query(q);

    let pos = false;
    let neg = false;
    let posneg = false;
    const ev = [];
    const ec = [];

    for (let row of res) {
        // console.log(row["association"]);
        if (row["association"] === "Positive") pos = true;
        else if (row["association"] === "Negative") neg = true;
        else if (row["association"] === "Positive/Negative") posneg = true;

        if (!ev.some((value) => value === row["evidencecodeid"]))
            ev.push(row["evidencecodeid"]);
        if (!ec.some((value) => value === row["envconditionid"]))
            ec.push(row["envconditionid"]);
    }

    let assoc = "";
    if ((pos && neg) || posneg) assoc = "Dual";
    else if (pos) assoc = "Positive";
    else if (neg) assoc = "Negative";
    else assoc = "N/A";

    return [assoc, ev, ec];
}

async function getEVcodes(evidList) {
    const q =
        "select code from evidencecodeBSRG " +
        `where evidencecodeid in (${evidList.join(",")})`;
    const res = await querySingleCol(q);

    const bind = res.some((value) => value === "Direct");
    const expr = res.some((value) => value === "Indirect");
    let ev = "";
    if (bind && expr) ev = "Binding & Expression";
    else if (expr) ev = "Expression";
    else if (bind) ev = "Binding";
    else ev = "N/A";
    return ev;
}

async function getECgroups(ecidList) {
    const q =
        "select ECG.biggroup,ECG.subgroup,EC.envconditiondesc from " +
        "envcondition as EC, envconditiongroups as ECG where " +
        `EC.envconditionid in (${ecidList.join(
            ","
        )}) and EC.groupid=ECG.groupid`;
    const res = await query(q);
    const envcon = res.map((row) => row["envconditiondesc"]);
    return [res, envcon];
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

//prettier-ignore
export async function getAllRegulations(biggroup, subgroup, evidence, pos, neg, NA, species) {

    // const envconQuery = getEnvconQuery(biggroup, subgroup, false);
    // const evidenceQuery = getEvidenceQuery(evidence, pos, neg, NA, false);

    const q = "select distinct O.gene, O.orf, P.protein from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        ` where R.tfid in (select orfid from orfgene where species in ('${dbspecies(species)}'))` +
        getEnvconQuery(biggroup, subgroup) +
        getEvidenceQuery(evidence, pos, neg, NA);
    // if (envconQuery !== "" && evidenceQuery !== "") q += ` where ${envconQuery} and ${evidenceQuery}`;
    // else if (envconQuery !== "") q += ` where ${envconQuery}`;
    // else if (evidenceQuery !== "") q += ` where ${evidenceQuery}`;

    const res = await query(q);
    return res.map((row) => {
        if (row["gene"] === "Uncharacterized") row["gene"] = row["orf"];
        return { gene: row["gene"], tf: row["protein"] };
    });
}

export async function getMegaAllRegulations(species, biggroup, subgroup) {
    const q =
        "select R.regulationid, O.gene, O.orf, P.protein, D.association, E.code" +
        " from regulation as R left outer join orfgene as O" +
        " on R.targetid=O.orfid left outer join protein as P ON R.tfid=P.tfid" +
        " left outer join regulationdata as D on R.regulationid=D.regulationid" +
        " left outer join evidencecodeBSRG as E on D.evidencecodeid=E.evidencecodeid" +
        ` where R.tfid in (select orfid from orfgene where species in ('${dbspecies(
            species
        )}'))` +
        getEnvconQuery(biggroup, subgroup);

    const regs = await query(q);
    const xd = formatRegulations(regs);
    return Object.keys(xd).map((id) => xd[id]);
}

function getEnvconQuery(biggroup, subgroup, and = true) {
    if (!biggroup || biggroup == undefined) return "";
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
    if (
        !evidence ||
        evidence == undefined ||
        (evidence !== "binding" && !pos && !neg && !NA)
    )
        return "";
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
        `regulation as R where R.tfid=${id}`;
    const res = await querySingleValue(q);
    if (res === null) return -1;
    return res;
}

export async function getTotalNumDBGenes(species) {
    const q = `select count(orf) as gTotal from orfgene where species in ('${dbspecies(
        species
    )}')`;
    const res = await querySingleValue(q);
    if (res === null) return -1;
    return res;
}

export async function getAllTFids(species) {
    const q =
        "select O.orfid from orfgene as O, protein " +
        `as P where O.species in ('${dbspecies(species)}') ` +
        `and O.orfid=P.tfid and (O.orfid ` +
        "in (select distinct tfid from regulation)" +
        ") order by P.protein asc";
    const res = await querySingleCol(q);
    return res;
}

export async function getGOids(geneIds, species, ontology, hyperN) {
    if (
        ontology !== "process" &&
        ontology !== "function" &&
        ontology !== "component"
    )
        ontology = "process";
    // prettier-ignore
    const q =
        "select G.goid, O.orf, O.gene from geneontology as G, goorflist as T left outer join orfgene as O on T.orfid=O.orfid " +
        `where T.orfid in (${geneIds.join(", ")}) and G.goid=T.goid and G.onto='${ontology}'`;
    const res = await query(q);
    let terms = [];
    // prettier-ignore
    for (let row of res) {
        terms.some((element) => element["goid"] === row["goid"])
            ? terms[
                  terms.findIndex((element) => element["goid"] === row["goid"])
              ]["genes"].push(row["gene"] === "Uncharacterized" ? row["orf"] : row["gene"])
            : terms.push({ goid: row["goid"], genes: [row["gene"] === "Uncharacterized" ? row["orf"] : row["gene"]] });
    }

    let gos = [];
    for (let row of terms) {
        const q_count =
            "select count(distinct orfid) as assoc from goorflist where " +
            `goid='${row["goid"]}' and orfid in (select distinct orfid from orfgene ` +
            `where species in ('${dbspecies(species)}'))` +
            ` and goid in (select distinct goid from geneontology where onto='${ontology}')`;
        const q_ontology = `select term, depth from geneontology where goid='${row["goid"]}' and onto='${ontology}'`;

        const res_count = await querySingleValue(q_count);
        const res_ontology = await querySingleRow(q_ontology);
        // TODO MISSING HYPERGEOMETRIC
        gos.push({
            goid: row["goid"],
            genes: row["genes"],
            setPer: Number.parseFloat(
                (row["genes"].length / geneIds.length) * 100
            ).toFixed(2),
            dbPer: Number.parseFloat((res_count / hyperN) * 100).toFixed(2),
            term: res_ontology["term"],
            depth: res_ontology["depth"],
        });
    }
    return gos;
}

export async function getSequence(ids, species = null) {
    //possible problem if species = array
    const speciesQ = species ? ` and species in ('${dbspecies(species)}')` : "";
    const q =
        `select orf,gene,promoterseq from orfgene where orfid in (${ids})` +
        speciesQ;
    const res = await query(q);
    return res;
}

export async function getMotifsFromDB(
    species,
    tfcList = false,
    bsrgOnly = true
) {
    const speciesQ = species
        ? ` and O.species in ('${dbspecies(species)}')`
        : "";
    const q =
        "select distinct P.tfid, P.protein, C.IUPACseq from protein as P, " +
        "consensus as C, tfconsensus as TFC, orfgene as O where " +
        "C.consensusid=TFC.consensusid and TFC.tfid=P.tfid and " +
        `P.tfid=O.orfid` +
        speciesQ +
        // use flag?
        " and TFC.source='BSRG curated'";

    const res = await query(q);
    let ret = [];
    if (tfcList) {
        for (let row of res) {
            ret.push({ tf: row["protein"], seq: row["IUPACseq"] });
        }
    } else {
        for (let row of res) {
            if (ret.some((element) => element["seq"] === row["IUPACseq"])) {
                ret.find((element) => element["seq"] === row["IUPACseq"])[
                    "tfs"
                ].push(row["protein"]);
            } else {
                ret.push({ tfs: [row["protein"]], seq: row["IUPACseq"] });
            }
        }
    }
    return ret;
}

export async function multiSearch(
    term,
    species = "Saccharomyces cerevisiae S288c"
) {
    let orfgene = term.repeat(1).trim();
    if (orfgene.length > 0) {
        switch (orfgene[orfgene.length - 1]) {
            case "p":
            case "P":
                orfgene = orfgene.substring(0, orfgene.length - 1);
        }
    }
    const q_orf = `select orf from orfgene where orf='${orfgene}' and species in ('${dbspecies(
        species
    )}')`;
    const q_gene = `select orf from orfgene where gene='${orfgene}' and species in ('${dbspecies(
        species
    )}')`;
    const q_alias = `select O.orf from orfgene as O, alias as A where A.alias='${orfgene}' and A.orfid=O.orfid and O.species in ('${dbspecies(
        species
    )}')`;
    const q_prot = `select O.orf from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${term}' and O.species in ('${dbspecies(
        species
    )}')`;

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
    return null;
}

export async function getPossibleMatches(term, species) {
    const q_orf =
        `select O.orf, O.gene, P.protein, A.alias, D.description from protein as P, orfgene as O ` +
        `left outer join alias as A on A.orfid=O.orfid left outer join description as D on O.descriptionid=D.descriptionid where O.orfid=P.tfid and ` +
        `O.species in ('${dbspecies(
            species
        )}') and (O.orf like '%${term}%' or O.gene like '%${term}%' or P.protein like '%${term}%' or A.alias like '%${term}%' or D.description like '%${term}%')`;
    // const q_gene = `select orf, gene from orfgene where gene like '%${term}%' and species='${dbspecies(species)}'`;
    // const q_alias = `select A.alias, O.orf, O.gene from orfgene as O, alias as A where A.alias like '%${term}%' and A.orfid=O.orfid and species='${dbspecies(species)}'`;
    // const q_protein = `select P.protein from protein as P, orfgene as O where P.protein like '%${term}%' and P.tfid=O.orfid and species='${dbspecies(species)}'`;
    // const q_desc = `select distinct O.orf, O.gene, D.description from description as D, orfgene as O where D.description like '%${term}%' and D.descriptionid=O.descriptionid and O.species='${dbspecies(species)}'`;
    const q_go = `select distinct goid, term, onto as ontology from geneontology where term like '%${term}%'`;
    // const q_func = `select distinct term from geneontology where onto='function' and term like '%${term}%'`;
    // const q_process = `select distinct term from geneontology where onto='process' and term like '%${term}%'`;
    // const q_component = `select distinct term from geneontology where onto='component' and term like '%${term}%'`;
    const q_reaction =
        `select MR.rid, MR.reactionname, MR.reactionstr, MM.modname from mreaction as MR, mmodel as MM ` +
        `where (MR.reactionname like '%${term}%' or MR.reactionstr like '%${term}%') and MR.modid in (` +
        `select modid from mmodel where species in ('${dbspecies(species)}'))` +
        " and MR.modid=MM.modid";
    // const q_reactionname =
    //     `select reactionname from mreaction where reactionname like '%${term}` +
    //     `%' and modid in (select modid from mmodel where species='${dbspecies(species)}')`;
    // const q_reactionstr =
    //     `select reactionstr from mreaction where reactionstr like '%${term}` +
    //     `%' and modid in (select modid from mmodel where species='${dbspecies(species)}')`;

    const orf_res = await query(q_orf);
    const go_res = await query(q_go);
    const reaction_res = await query(q_reaction);
    // const gene_res = await query(q_gene);
    // const alias_res = await query(q_alias);
    // const protein_res = await query(q_protein);
    // const description_res = await query(q_desc);
    // const func_res = await query(q_func);
    // const process_res = await query(q_process);
    // const component_res = await query(q_component);
    // const reactionname_res = await query(q_reactionname);
    // const reactionstr_res = await query(q_reactionstr);

    let orf_map = [];
    // aggregate all alias of an orf/gene into same row
    for (let row of orf_res) {
        const i = orf_map.findIndex((el) => el["orf"] === row["orf"]);
        if (i === -1)
            orf_map.push({ ...row, alias: row.alias ? [row.alias] : [] });
        else orf_map[i]["alias"].push(row["alias"]);
    }

    return {
        orf: orf_map,
        go: go_res,
        reaction: reaction_res,
        // gene: gene_res,
        // alias: alias_res,
        // // protein: protein_res.map((row) => row["protein"]),
        // protein: protein_res,
        // description: description_res,
        // // func: func_res.map((row) => row["term"]),
        // Function: func_res,
        // // process: process_res.map((row) => row["term"]),
        // process: process_res,
        // // component: component_res.map((row) => row["term"]),
        // component: component_res,
        // // reactionname: reactionname_res.map((row) => row["reactionname"]),
        // reactionName: reactionname_res,
        // // reactionstr: reactionstr_res.map((row) => row["reaction_str"]),
        // reactionString: reactionstr_res,
    };
}

export async function getORFinfo(orfid) {
    const q_orf = `select * from orfgene where orfid=${orfid}`;
    // const q_protein = `select protein from protein where tfid=${orfid}`;
    const q_desc =
        `select D.description from orfgene as O, description as D ` +
        `where D.descriptionid=O.descriptionid and O.orfid=${orfid}`;
    const q_alias = `select alias from alias where orfid=${orfid}`;

    const orf = await querySingleRow(q_orf);
    // const prot = await querySingleValue(q_protein);
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
    const general = {};

    // copy paste from frontend because reasons
    let sstrain = "";
    for (let key of Object.keys(speciesList)) {
        const strains = [];
        for (let strain of speciesList[key].dbstrains) {
            strains.push(speciesList[key].dbspecies + " " + strain);
        }
        if (strains.includes(orf["species"])) {
            for (let strain of speciesList[key].dbstrains) {
                if (
                    speciesList[key].dbspecies + " " + strain ===
                    orf["species"]
                ) {
                    sstrain = strain;
                    break;
                }
            }
            break;
        }
    }

    general["standard_Name"] = orf["gene"];
    general["systematic_Name"] = orf["orf"];
    general["description"] = desc;
    ret["alias"] = alias_res.map((row) => row["alias"]).join(", ");
    ret["strain"] = sstrain;
    const extIndex = orf["gdid"].indexOf(":");
    ret["ext"] =
        extIndex !== -1 ? orf["gdid"].substring(extIndex + 1) : orf["gdid"];
    ret["gene_Sequence"] = orf["geneseq"];
    ret["promoter_Sequence"] = orf["promoterseq"];
    ret["chr_Coordinates"] = orf["coords"];
    if (allele) ret["allele"] = allele;

    return { general: general, locus: ret };
}

export async function getProteinInfo(tfid) {
    const q_prot =
        "select P.*,O.orfid,O.orf,O.gdid from protein as P, orfgene " +
        `as O where P.tfid=O.orfid and P.tfid=${tfid}`;
    const q_cons =
        "select C.IUPACseq from tfconsensus as T, consensus as C, " +
        `protein as P, orfgene as O where P.tfid=T.tfid and ` +
        "T.consensusid=C.consensusid and P.tfid=O.orfid and " +
        `P.tfid=${tfid}`;

    const prot_res = await querySingleRow(q_prot);
    const cons_res = await query(q_cons);

    const ret = {};
    ret["protein_name"] = prot_res["protein"];
    ret["aminoacid_sequence"] = prot_res["aminoacidseq"];
    // gdid ?
    ret["TFBS"] = cons_res.map((row) => row["IUPACseq"]);
    // has_regdoc ?
    return ret;
}

export async function getGOinfo(orfid) {
    const q =
        "select GO.goid,GO.term,GO.depth,GO.onto from goorflist as OL, " +
        `geneontology as GO where OL.orfid='${orfid}' ` +
        "and OL.goid=GO.goid order by GO.depth";

    const res = await query(q);

    const ret = { process: [], function: [], component: [] };
    for (let row of res) {
        ret[row["onto"]].push({
            goid: row["goid"],
            depth: row["depth"],
            term: row["term"],
        });
    }
    return ret;
}

export async function getOrthologInfo(orfid, species) {
    const homologSpecies = await getHomologSpecies(species);
    const hspString = "'" + homologSpecies.join("','") + "'";
    const hList = {};
    for (let synteny = 0; synteny < 4; synteny++) {
        let q =
            "select orf,gene,species from orthologs left outer join orfgene on orfiddest=orfid where " +
            `orfidsrc=${orfid} and classif=${synteny} and species not in ('${dbspecies(
                species
            )}')`;
        // $diff?
        if (synteny < 3)
            q +=
                " and orfiddest not in (select OD.orfid " +
                "from orthologs as H, orfgene as O, orfgene as OD where " +
                `H.orfidsrc=O.orfid and O.orfid=${orfid} and ` +
                `H.orfiddest=OD.orfid and OD.species in (${hspString}) and H.classif>${synteny})`;
        const res = await query(q);
        hList[synteny] = res.map((row) => ({ ...row, synteny: synteny })); //.filter((row) => row["species"] !== species);
    }
    return hList;
}

async function getHomologSpecies(species) {
    const q =
        "select distinct species from orfgene where orfid in (select " +
        "distinct orfiddest from orthologs where orfidsrc in (select " +
        `distinct orfid from orfgene where species in ('${dbspecies(
            species
        )}')))`;

    const res = await query(q);
    const hsp = [];
    for (let sp of res) {
        if (sp["species"] !== species)
            hsp.push(sp["species"].replaceAll("'", "\\'"));
    }
    return hsp;
}

export async function getMetabGeneInfo(id, species) {
    const q =
        "select R.reactionid,R.reactionname,R.generule,M.modname from orfgene as O, " +
        "mreactiongenes as RG, mreaction as R, mmodel as M WHERE " +
        `O.orfid=RG.orfid AND RG.rid=R.rid AND O.orfid=${id} ` +
        `and O.species in ('${dbspecies(species)}') ` +
        "AND M.modid=R.modid";
    const res = await query(q);
    return res;
}

export async function getReactionInfo(modname, rid) {
    // Validate modname
    const q_model = "select distinct modname from mmodel";
    const res_model = await querySingleCol(q_model);
    if (!res_model.includes(modname)) return [];

    // Validate reactionid
    const q_rid =
        "SELECT distinct reactionid from mreaction where modid=" +
        `(SELECT modid FROM mmodel WHERE modname='${modname}')`;
    const res_rid = await querySingleCol(q_rid);
    if (!res_rid.includes(rid)) return [];

    const q =
        "SELECT M.modname,M.pubmedid,M.url, " +
        "R.rid,R.reactionid,R.reactionname,R.generule,R.reactionstr " +
        "FROM mmodel as M, mreaction as R WHERE M.modid=R.modid " +
        `AND M.modname='${modname}' AND R.reactionid='${reactionid}'`;
    const res = await query(q);
    //FIXME GENE RULE ?
    let ret = [];
    for (let row of res) {
        const q_orf =
            "SELECT orf FROM orfgene WHERE orfid in " +
            `(SELECT orfid FROM mreactiongenes WHERE rid=${row["rid"]})`;
        const res_orf = await querySingleCol(q_orf);
        ret.push({ ...row, orfs: res_orf });
    }
    return ret;
}

export async function getTFBSinfo(id, consensus) {
    const q =
        "select distinct TFC.tfconsensusid, P.protein, C.IUPACseq, EC.code, " +
        "EC.experiment, Pub.*,CD.strain from pubmed as Pub, tfconsensus as TFC, " +
        "consensus as C, protein as P, consensusdata as CD, " +
        `evidencecodeBSRG as EC where P.tfid=${id} and ` +
        `C.IUPACseq='${consensus}' and C.consensusid=TFC.consensusid and ` +
        "TFC.tfid=P.tfid and TFC.tfconsensusid=CD.tfconsensusid and " +
        "CD.evidencecodeid=EC.evidencecodeid " +
        "and Pub.pubmedid=CD.pubmedid order by P.protein asc";

    const res = await query(q);
    for (let row of res) {
        const qev =
            "select distinct EV.envconditiondesc from envcondition as EV, " +
            "consensusdata as CD where EV.envconditionid=CD.envconditionid " +
            `and CD.tfconsensusid=${row["tfconsensusid"]} and CD.pubmedid=${row["pubmedid"]}`;
        const resev = await query(qev);
        if (resev)
            row["environmental_Condition"] = resev.map(
                (row) => row["envconditiondesc"]
            );
        else row["environmental_Condition"] = ["N/A"];
    }
    return res;
}

export async function getGOtermInfo(id, species) {
    const q = `select * from geneontology where goid='${id}'`;
    const res = await querySingleRow(q);

    const q_parents =
        `select G.* from geneontology as G, goparents as P where ` +
        `P.goidson='${res["goid"]}' and P.goid=G.goid`;
    const res_parents = await query(q_parents);

    const q_children =
        `select G.* from geneontology as G, goparents as P where ` +
        `P.goid='${res["goid"]}' and P.goidson=G.goid`;
    const res_children = await query(q_children);

    const q_genes =
        "select O.orf,O.gene,O.species from orfgene as O, goorflist " +
        `as GL where GL.goid='${res["goid"]}' and GL.orfid=O.orfid ` +
        `and O.species in ('${dbspecies(species)}')`;
    const res_genes = await query(q_genes);

    return {
        go: res,
        parents: res_parents,
        children: res_children,
        genes: res_genes,
    };
}

export async function getRegulationInfo(tfid, orfid) {
    const q =
        "select RD.regulationid, P.protein, O.orf,O.gene, RD.association, " +
        "RD.strain, EV.code,EV.experiment, Pub.* " +
        "from pubmed as Pub, regulation as R, orfgene as O, " +
        "protein as P, regulationdata as RD, evidencecodeBSRG as EV " +
        "where P.tfid=R.tfid and R.targetid=O.orfid " +
        `and O.orfid=${orfid} and P.tfid=${tfid} ` +
        "and RD.evidencecodeid=EV.evidencecodeid " +
        "and R.regulationid=RD.regulationid " +
        "and RD.pubmedid=Pub.pubmedid";
    const res = await query(q);

    // ONLY WORKS IF N_ENTRIES_OF_SAME_PUBMED = N_ENVCONS_OF_SAME_PUBMED
    let ret = [];
    let aux = {};
    for (let row of res) {
        if (aux[row["pubmedid"]] !== undefined) aux[row["pubmedid"]].push(row);
        else aux[row["pubmedid"]] = [row];
    }
    for (let pubmedid of Object.keys(aux)) {
        const qec =
            "select EV.envconditiondesc from envcondition as EV, " +
            "regulationdata as RD where EV.envconditionid=RD.envconditionid " +
            `and RD.regulationid=${aux[pubmedid][0].regulationid} and RD.pubmedid=${pubmedid}`;
        const envc = await querySingleCol(qec);
        // console.log(envc);
        for (let i = 0; i < aux[pubmedid].length; i++) {
            ret.push({ ...aux[pubmedid][i], envcond: envc[i] });
        }
    }
    return ret;
}

export async function getSpecies() {
    const q = "select distinct species from orfgene";
    const res = await query(q);
    return res.map((row) => row["species"]);
}

export async function getEnvCons() {
    const q = "select distinct biggroup,subgroup from envconditiongroups";
    const res = await query(q);
    const ec = {};
    for (let row of res) {
        if (ec[row["biggroup"]]) ec[row["biggroup"]].push(row["subgroup"]);
        else ec[row["biggroup"]] = [row["subgroup"]];
    }
    return ec;
}
