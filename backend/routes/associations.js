import {
    searchRegulations,
    rankTF,
    rankGO,
    // lmaoService,
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
        else if (err.message === "Species not found")
            res.status(400).send("Unknown species");
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
        else if (err.message === "Species not found")
            res.status(400).send("Unknown species");
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
        else if (err.message === "Species not found")
            res.status(400).send("Unknown species");
        else res.status(500).send("Internal Server Error");
    }
});

// router.get("/lmao", async (req, res, next) => {
//     try {
//         const result = await lmaoService({
//             tfs: "Pdr1\nHaa1\nMsn2\nYap1",
//             species: "scerevisiae",
//         });
//         console.log(result.length);
//         res.status(200).json(result);
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("oops");
//     }
// });

export default router;
