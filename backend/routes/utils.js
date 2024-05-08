import { Router } from "express";
const router = Router();

/* GET users listing. */
router.get("/species", (req, res, next) => {
    try {
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

export default router;
