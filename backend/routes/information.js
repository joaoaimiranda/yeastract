import { Router } from "express";
import { advancedSearch, getORF } from "../service/informationService.js";
const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const result = await advancedSearch(req.query);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "No Search Term")
            res.status(400).send("Search Term not provided");
        else if (err.message === "No species specified")
            res.status(400).send("No species specified");
        else if (err.message === "Search Term Not Accepted")
            res.status(400).send("Invalid Search Term");
        else res.status(500).send("Internal Server Error");
    }
});

router.get("/orf", async (req, res, next) => {
    try {
        const result = await getORF(req.query);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        if (err.message === "ORF name is empty")
            res.status(400).send(err.message);
        else if (err.message === "ORF/Gene not found")
            res.status(404).send(err.message);
        else res.status(500).send("Internal Server Error");
    }
});

export default router;
