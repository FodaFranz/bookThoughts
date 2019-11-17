import express, { Router } from "express";
import SeriesController from "../controllers/seriesController";
import noteRoutes from "./noteRoutes";

const router: Router = express.Router();

const seriesController: SeriesController = new SeriesController();

/*
    Description: gets all series from db
*/
router.get("/", (req, res) => {
    seriesController.getAll(req,res);
})

router.get("/:id", (req, res) => {
    seriesController.get(req,res);
})

/*
    Description: edit series
*/
router.put("/edit/:id", (req, res) => {
    seriesController.edit(req, res);
})

/*
    Description: delete series from db (including books or without?)
*/
router.delete("/delete/:id", (req, res) => {
    seriesController.delete(req, res);
})

/*
    Body: title, startDate?, finishDate?, rating?
    Description: adds series to db
*/
router.post("/add", (req, res) => {
    seriesController.add(req, res);
})

router.use("/notes", noteRoutes);

//#region books

/*
    Description: adds book to series
*/
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

export = router;