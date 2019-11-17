/*
TODO: 
    -advance findLoacally (filter functions)
    -fix states
    -test
*/

import fetch from "node-fetch";
import mongoose, { mongo } from "mongoose";
import Book, { IBook, BookSchema } from "../models/bookModel";
import express from "express";
import config from "../build/config.json";
import Author from "../models/authorObject";

class bookController {
    apiKey: String;

    constructor() {
        this.apiKey = config.web.apikey;
    }

    /*
        Description: returns every book in the database
    */
    getAll(req: express.Request, res: express.Response) {
        Book.find({}, (err: Error, result: IBook[]) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.status(200).json(result);
            }
        })
    }

    get(req: express.Request, res: express.Response) {
        Book.findById(req.params.id, (err: Error, result: IBook) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                if(result === null) 
                    res.status(404).send(`${req.params.id} not found`);
                else
                    res.status(200).send(result);
            }
        })
    }

    /*
        Body: searchTerm
        Description: Searches for the criteria in the mongodb db
    */
    findLocally(req: express.Request, res: express.Response) {
        const searchTerm: String = req.body.searchTerm.toLowerCase();

        Book.find({
            $or: [
                { 'title_lower': { $regex: '.*' + searchTerm + '.*' } },
                { 'subTitle_lower': { $regex: '.*' + searchTerm + '.*' }},
                { 'description_lower': { $regex: '.*' + searchTerm + '.*' }},
                { 
                    'authors': { 
                        $elemMatch: { 
                            name_lower: { 
                                $regex: '.*' + searchTerm + '.*' 
                            } 
                        } 
                    }
                }
            ]
        }, (err: Error, result: IBook[]) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.status(200).json(result);
            }
        });
    }

    /*
        Body: book with updated values
        Url: .../edit/<id>
        Description: update a book
    */
    edit(req: express.Request, res: express.Response) {
        Book.replaceOne({ _id: req.params.id }, req.body, (err: Error, raw: any) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.status(200).send(req.body);
            }
        })
    }

    /*
        Body: empty
        Url: .../delete/<id>
        Description: deletes book from db (including all notes)
    */
    delete(req: express.Request, res: express.Response) {
        const id: String = req.params.id;
        Book.findByIdAndDelete(id, (err: Error, response: IBook | null) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                if (response === null) {
                    res.status(404).send(`${id} does not exist`);
                }
                else {
                    res.status(200).json(response);                    
                }
            }
        });
    }

    /*
        Body: big boi JSON-Object from Google API, [rating], [startDate], [finishDate], [state]
        Description: Adds book to the db
    */
    add(req: express.Request, res: express.Response) {
            this.addBookToDb(req.body.volumeInfo, req.body.currentPage, req.body.volumeInfo.authors, req.body.rating, req.body.startDate, req.body.finishDate, req.body.state)
            .then(result => res.status(200).json(result))
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            })
    }

    createAuthorArray(authorNames: [String]) {
        let authors: Author[] = [];

        authorNames.forEach(authorName => {
            authors.push(new Author(authorName));
        })

        return authors;
    }

    addBookToDb(googleData: any, currentPage: Number, authors: any, rating: Number, startDate: Date, finishDate: Date, state: String) {
        return new Promise<IBook>((resolve, reject) => {
            const id: mongoose.Types.ObjectId = mongoose.Types.ObjectId();

            let authorObjects: Author[] = this.createAuthorArray(authors);

            const book: IBook = new Book({
                _id: id,
                authors: authorObjects,
                _date: new Date(),
                title: googleData.title,
                title_lower: googleData.title.toLowerCase(),
                subTitle: googleData.subtitle || "",
                subTitle_lower: googleData.subtitle == undefined ? "" : googleData.subtitle.toLowerCase(),
                startDate: startDate === undefined ? new Date() : undefined,
                finishDate: finishDate,
                categories: googleData.categories,
                rating: rating,
                pageCount: googleData.pageCount,
                description: googleData.description,
                description_lower: googleData.description.toLowerCase(),
                publishedDate: googleData.publishedDate,
                currentPage: currentPage,
                state: state,
                notes: []
            });

            book.save((err, result) => {
                if (err) reject(err);

                if (result != null)
                    resolve(result);
                else
                    reject("Something went wrong while adding the book the the db ...");
            });
        });

    }

    /*
        Description: gets authors of book id
    */
    getAuthors(req: express.Request, res: express.Response) {
        let id: String = req.params.id;

        Book.find({ _id: id }, "authors", (err: Error, authors: any) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                if (authors === [])
                    res.status(404).send(`${id} does not exist`);
                else
                    res.status(200).json(authors);
            }
        })
    }

    /*
        Description: Queries the Google-Books-API for the Author an Title, sends back the first 5 results
                 the user can then select one of the results to add to his reading-list.
    */
    findGlobally(req: express.Request, res: express.Response) {
        const title: String = req.body.title || "";
        const authorName: String = req.body.author || "";

        fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}+${authorName}&key=${this.apiKey}&language=en`)
            .then(res => res.json())
            .then(json => {
                res.status(200).json(json.items.slice(0, 30));
            })
            .catch(err => {
                console.log(err);
                res.status(500).send("Something went wrong ...");
            })
    }
}

export = bookController;