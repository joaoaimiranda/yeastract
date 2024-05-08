import { motifOnPromoter, tfbsByMotif } from "../service/seqService.js";
import { Router } from "express";
const router = Router();

router.post("/motif-on-promoter", (req, res, next) => {
    try {
        const result = motifOnPromoter(req.body);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/tfbs-by-motif", (req, res, next) => {
    try {
        const result = tfbsByMotif(req.body);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
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
