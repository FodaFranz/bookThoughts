import express, { Router } from "express";
import NoteController from "../controllers/noteController";

const noteController: NoteController = new NoteController();

const router: Router = express.Router();

router.get("/", (req, res) => {
    noteController.getAll(req, res);
})

export = router;