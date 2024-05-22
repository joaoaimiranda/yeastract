import { getMegaAllRegulations } from "../db/repository.js";
import {
    searchRegulations,
    rankTF,
    rankGO,
} from "../service/associationsService.js";
import { Router } from "express";
const router = Router();

router.post("/search", async (req, res, next) => {
    try {
        const result = await searchRegulations(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/ranktf", async (req, res, next) => {
    try {
        const result = await rankTF(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else res.status(500).send("Internal Server Error");
    }
});

router.post("/rankgo", async (req, res, next) => {
    try {
        const result = await rankGO(req.body);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "Bad Request")
            res.status(400).send("Request Body format not accepted");
        else if (err.message === "No genes provided")
            res.status(400).send("No genes provided");
        else res.status(500).send("Internal Server Error");
    }
});

router.get("/lmao", async (req, res, next) => {
    try {
        const result = await getMegaAllRegulations(
            "Saccharomyces cerevisiae S288c"
        );
        console.log(result.length);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send("oops");
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
//     ]).then((value) => {
//         if (value[0][0]["orfid"] !== undefined) return value[0][0]["orfid"];
//         else throw new Error("Database query error");
//     });
// }

export default router;
