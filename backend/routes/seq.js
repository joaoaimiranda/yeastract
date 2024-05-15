import {
    motifOnPromoter,
    tfbsByMotif,
    seqRetrieval,
    promoterAnalysis,
    tfConsensus,
} from "../service/seqService.js";
import { Router } from "express";
const router = Router();

router.post("/motif-on-promoter", async (req, res, next) => {
    try {
        const result = await motifOnPromoter(req.body);
        console.log(result);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/tfbs-by-motif", async (req, res, next) => {
    try {
        const result = await tfbsByMotif(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/seq-retrieval", async (req, res, next) => {
    try {
        const result = await seqRetrieval(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/prom-analysis", async (req, res, next) => {
    try {
        const result = await promoterAnalysis(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.get("/tf-consensus", async (req, res, next) => {
    try {
        const result = await tfConsensus(req.query);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request") res.status(400).send("Bad Request");
        else res.status(500).send("Internal Server Error");
    }
});

// async function getID(element) {
//     const q1 = `select O.orfid from orfgene as O LEFT OUTER JOIN protein as P ON P.tfid=O.orfid WHERE (O.orf='${element}' or O.gene='${element}') and O.species in ('Saccharomyces cerevisiae S288c');`;

//     const q2 = `select O.orfid from orfgene as O, alias as A, protein as P where A.orfid=O.orfid and P.tfid=O.orfid and A.alias='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

//     const q3 = `select O.orfid from orfgene as O, protein as P where P.tfid=O.orfid and P.protein='${element}' and O.species in ('Saccharomyces cerevisiae S288c');`;

//     return Promise.any([
//         dbaccess.query(q1),
//         dbaccess.query(q2),
//         dbaccess.query(q3),
//     ]).then((value) => value[0][0]["orfid"]);
// }

export default router;
