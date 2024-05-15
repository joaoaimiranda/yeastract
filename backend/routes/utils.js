import { Router } from "express";
const router = Router();
import { species } from "../service/utilsService.js";
router.get("/species", async (req, res, next) => {
    try {
        const result = await species();
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});

export default router;
