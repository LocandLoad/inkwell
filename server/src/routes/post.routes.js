import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/posts", async (req, res) => {
    try {
        const { authorId, title, body } = req.body;
        const post = await PostService.publish({ authorId, title, body });
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({
            error: { code: err.code || "VALIDATION_ERROR", message:err.message },
        });
    }
});
router.get("/posts", async (req, res, next) => {
    try {
        const { page = 1, search } = req.query;
        const result = search
        ? await PostService.search({ query: search, page: Number(page) })
        : await PostService.listPublished({ page: Number(page)});
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.post("/posts", requireAuth, async (req, res, next) =>
{
    try {
        // Never trust client-supplied identity fields — derive
        // authorId from the authenticated request, not the request body.
        const post = await PostService.publish({
            ...req.body,
            authorId: req.user.id, // set by requireAuth middleware from the verified JWT
        });
        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
});

router.delete("/posts/:id", requireAuth, async (req, res, next) => {
    try {
        const post = await PostService.getById(req.params.id);
        if (!post) return res.status(404).json({ error: { code:"NOT_FOUND" } });
        // A01's fix, in one line: check that the logged-in useractually
        // owns this resource before allowing the action on it.
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: { code: "FORBIDDEN" } });
        }
        await PostService.delete(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

export default router;