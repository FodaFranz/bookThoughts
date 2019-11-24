import express, { Router } from "express";
import NoteController from "../controllers/noteController";

const noteController: NoteController = new NoteController();

const router: Router = express.Router();

router.get("/", (req, res) => {
    noteController.getAll(req, res);
})

router.post("/add/:id", (req, res) => {
    noteController.add(req, res);
})

router.put("/edit/:id", (req, res) => {
    noteController.edit(req, res);
})

router.delete("/delete/:id", (req, res) => {
    noteController.delete(req, res);
});

export = router;