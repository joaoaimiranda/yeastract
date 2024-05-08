import { Router } from "express";
import { advancedSearch } from "../service/informationService.js";
const router = Router();

router.get("/", (req, res, next) => {
    try {
        const result = advancedSearch(req.body);
        res.status(200).json(result);
    } catch (err) {
        if (err.message === "No Search Term")
            res.status(400).send("Bad Request - Search Term not provided");
        else if (err.message === "No species specified")
            res.status(400).send("Bad Request - No species specified");
        else if (err.message === "Search Term Not Accepted")
            res.status(400).send("Bad Request - Search Term Not Accepted");
        else res.status(500).send("Internal Server Error");
    }
});

export default router;
