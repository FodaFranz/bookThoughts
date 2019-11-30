import express, { Router } from "express";
import BookController from '../controllers/bookController';

const router: Router = express.Router();

const bookController: BookController = new BookController();

router.get("/", (req, res) => {
    bookController.getAll(req, res);
})

router.get("/:id", (req, res) => {
    bookController.get(req, res);
})

router.post("/add", (req, res) => {
    bookController.add(req, res);
});

router.put("/edit/:id", (req, res) => {
    bookController.edit(req, res);
})

router.delete("/delete/:id", (req, res) => {
    bookController.delete(req, res);
})

router.get("/findglobally/:searchPhrase", (req, res) => {
    bookController.findGlobally(req, res);
})

router.get("/findlocally/:searchPhrase", (req, res) => {
    bookController.findLocally(req, res);
})

router.get("/getauthors/:id", (req, res) => {
    bookController.getAuthors(req, res);
});

export = router;