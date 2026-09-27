import { Router } from "express";
import { StatListener } from "../events/listeners/count-published-posts.listener.js";

const router = Router();
router.get("/stats", (req, res) => {
    res.status(200).json(StatListener.getStats());
});

export default router;