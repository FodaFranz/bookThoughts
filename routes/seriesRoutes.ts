import express, { Router } from "express";
import SeriesController from "../controllers/seriesController";
import noteRoutes from "./noteRoutes";

const router: Router = express.Router();

const seriesController: SeriesController = new SeriesController();

router.get("/", (req, res) => {
    seriesController.getAll(req,res);
})

router.get("/:id", (req, res) => {
    seriesController.get(req,res);
})

router.put("/edit/:id", (req, res) => {
    seriesController.edit(req, res);
})

router.delete("/delete/:id", (req, res) => {
    seriesController.delete(req, res);
})

router.post("/add", (req, res) => {
    seriesController.add(req, res);
})

//#region books

router.post("/addBooks/:id", (req, res) => {
    seriesController.addBook(req, res);
})

router.delete("/removeBooks/:id", (req, res) => {
    seriesController.removeBooks(req, res);
})

router.get("/getBooks/:id", (req, res) => {
    seriesController.getBooks(req, res);
})

//#endregion books

router.use("/:parentId/notes", noteRoutes);

export = router;