import express, { Router } from "express";
import BookController from '../controllers/bookController';

const router: Router = express.Router();

const bookController: BookController = new BookController();

/*
    Description: gets all books from db
*/
router.get("/", (req, res) => {
    bookController.getAll(req, res);
})

router.get("/:id", (req, res) => {
    bookController.get(req, res);
})

/*
    Body: <values to change>
    Url: .../edit/<id>
    Description: update a book
*/
router.put("/edit/:id", (req, res) => {
    bookController.edit(req, res);
})

/*
    Body: empty
    Url: .../delete/<id>
    Description: delete book from db (including all notes)
*/
router.delete("/delete/:id", (req, res) => {
    bookController.delete(req, res);
})

/*
    Body: big boi JSON-Object from Google API, [rating], [startDate], [finishDate], [state]
    Description: Adds book to the db
*/
router.post("/add", (req, res) => {
    bookController.add(req, res);
});

/*
    Description: Queries the Google-Books-API for the Author an Title, sends back the first 5 results
                 the user can then select one of the results to add to his reading-list.
*/
router.get("/findglobally", (req, res) => {
    bookController.findGlobally(req, res);
})

/*
    Body: searchTerm
    Description: Searches the db for results
*/
router.get("/findlocally", (req, res) => {
    bookController.findLocally(req, res);
})

/*
    URL: .../getauthors/[id]
    Description: gets authors of book
*/
router.get("/getauthors/:id", (req, res) => {
    bookController.getAuthors(req, res);
});

export = router;