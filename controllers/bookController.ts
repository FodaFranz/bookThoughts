/*
TODO: 
    -advance findLoacally (filter functions)
    -fix states
    -test
*/

import fetch from "node-fetch";
import mongoose, { mongo } from "mongoose";
import Book, { IBook } from "../models/bookModel";
import express from "express";
import config from "../build/config.json";
import Author from "../models/authorObject";
import { rejects } from "assert";

class bookController {
    apiKey: String;

    constructor() {
        this.apiKey = config.web.apikey;
    }

    getAll(req: express.Request, res: express.Response) {
        Book.find({}, (err: Error, books: IBook[]) => {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else
                res.status(200).json(books);
        })
    }

    get(req: express.Request, res: express.Response) {
        this.getById(req.params.id)
            .then(book => res.status(200).json(book))
            .catch(err => {
                console.log(err);
                res.status(500).send(err.message);
            })
    }

    //#region add
    add(req: express.Request, res: express.Response) {
        this.createAuthorObject(req.body.authors)
            .then(authors => this.addBook(req.body, authors))
            .then(book => res.status(200).json(book))
            .catch(err =>  {
                console.log(err);
                res.status(500).send(err.message);
            })
    }

    createAuthorObject(authors: [String]): Promise<Author[]> {
        let authorObjects: Author[] = [];

        return new Promise<Author[]>((resolve, reject) => {
            try {
                authors.forEach((author, i) => {
                    authorObjects.push(new Author(author));

                    if(i == authors.length - 1) 
                        resolve(authorObjects);
                })
            }
            catch(err) {
                reject(err);
            }

        })
    }

    addBook(data: any, authors: Author[]): Promise<IBook> {
        return new Promise<IBook>((resolve, reject) => {
            try {
                const book: IBook = new Book({
                    _id: mongoose.Types.ObjectId(),
                    _lastModified: new Date(),
                    _creationDate: new Date(),
                    title: data.title,
                    title_lower: data.title === undefined ? undefined : data.title.toLowerCase(),
                    subTitle: data.subTitle || "",
                    title_subTitle: data.subTitle === undefined ? undefined : data.subTitle.toLowerCase(),
                    pageCount: data.pageCount,
                    description: data.description,
                    description_lower: data.description === undefined ? undefined : data.description.toLowerCase(),
                    authors: authors,
                    categories: data.categories,
                    startDate: data.startDate,
                    finishDate: data.finishDate,
                    rating: data.rating,
                    state: data.state
                });

                book.save((err: Error, book: IBook) => {
                    if(err)
                        reject(err);
                    else
                        resolve(book);
                })
            }
            catch(err) {
                reject(err);
            }
        });
    }
    
    //#endregion add

    findLocally(req: express.Request, res: express.Response) {
        const searchTerm: String = req.params.searchPhrase.toLowerCase();

        Book.find({
            $or: [
                { 'title_lower': { $regex: '.*' + searchTerm + '.*' } },
                { 'subTitle_lower': { $regex: '.*' + searchTerm + '.*' } },
                { 'description_lower': { $regex: '.*' + searchTerm + '.*' } },
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
        }, (err: Error, books: IBook[]) => {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else
                res.status(200).json(books);
        });
    }

    //#region edit
    edit(req: express.Request, res: express.Response) {
        this.createAuthorObject(req.body.authors)
            .then(authors => {
                const newBook: IBook = new Book({
                    _id: req.params.id,
                    _lastModified: new Date(),
                    title: req.body.title,
                    title_lower: req.body.title === undefined ? undefined : req.body.title.toLowerCase(),
                    subTitle: req.body.subTitle,
                    subTitle_lower: req.body.subTitle === undefined ? undefined : req.body.subTitle.toLowerCase(),
                    startDate: req.body.startDate,
                    finishDate: req.body.finishDate,
                    categories: req.body.categories,
                    rating: req.body.rating,
                    pageCount: req.body.pageCount,
                    description: req.body.description,
                    description_lower: req.body.description === undefined ? undefined : req.body.description.toLowerCase(),
                    state: req.body.state,
                    authors: authors,
                    notes: req.body.notes
                });
        
                this.createNewBook(req.params.id, newBook)
                    .then(book => this.replaceBook(req.params.id, book))
                    .then(newBook => res.status(200).send(newBook))
                    .catch(err => {
                         console.log(err);
                         res.status(500).send(err.message);
                    })
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err.message);
            })
        
    }

    createNewBook(id: String, newBook: IBook): Promise<IBook> {
        return new Promise<IBook>((resolve, reject) => {
            Book.findById(id, (err: Error, oldBook: IBook) => {
                if(err)
                    reject(err);
                else {
                    if(oldBook === null) {
                        reject(new Error(`Book ${id} not found`));
                    }
                    else {
                        newBook._creationDate = oldBook._creationDate;
                        if(newBook.title === undefined) {
                            newBook.title = oldBook.title;
                            newBook.title_lower = oldBook.title_lower;
                        }

                        if(newBook.subTitle === undefined) {
                            newBook.subTitle = oldBook.subTitle;
                            newBook.subTitle_lower = oldBook.subTitle_lower;
                        }

                        if(newBook.startDate === undefined) newBook.startDate = oldBook.startDate;
                        if(newBook.finishDate === undefined) newBook.finishDate = oldBook.finishDate;
                        if(newBook.categories.length as Number === 0) newBook.categories = oldBook.categories;
                        if(newBook.rating === undefined) newBook.rating = oldBook.rating;
                        if(newBook.pageCount === undefined) newBook.pageCount = oldBook.pageCount;

                        if(newBook.description === undefined) {
                            newBook.description = oldBook.description;
                            newBook.description_lower = oldBook.description_lower;
                        } 

                        if(newBook.state === undefined) newBook.state = oldBook.state;
                        if(newBook.authors.length as Number === 0) newBook.authors = oldBook.authors;
                        if(newBook.notes === undefined) newBook.notes = oldBook.notes;

                        resolve(newBook);
                    }
                }
            });
        })
    }
    //#endregion edit

    delete(req: express.Request, res: express.Response) {
        const id: String = req.params.id;
        Book.findByIdAndDelete(id, (err: Error, response: IBook | null) => {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
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

    getAuthors(req: express.Request, res: express.Response) {
        const id: String = req.params.id;

        Book.find({ _id: id }, "authors", (err: Error, authors: any) => {
            if (err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                if (authors === [])
                    res.status(404).send(`${id} does not exist`);
                else
                    res.status(200).json(authors);
            }
        })
    }

    findGlobally(req: express.Request, res: express.Response) {
        const searchPhrase: String = (req.params.searchPhrase as String).replace(" ", "+");

        fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchPhrase}&key=${this.apiKey}&langrestrict=en`)
            .then(res => res.json())
            .then(json => {
                res.status(200).json(json.items.slice(0, 30));
            })
            .catch(err => {
                console.log(err);
                res.status(500).send(err.message);
            })
    }

    //#region utility
    getById(id: String) {
        return new Promise<IBook>((resolve, reject) => {
            Book.findById(id, (err: Error, book: IBook) => {
                if (err)
                    reject(err);
                else {
                    if (book == null)
                        reject(new Error(`Book ${id} not found`));
                    else
                        resolve(book);
                }
            })
        })
    }

    replaceBook(id: String, newBook: IBook) {
        return new Promise((resolve, reject) => {
            Book.replaceOne({ _id: id }, newBook, (err: Error, result: any) => {
                if (err)
                    reject(err);
                else
                    resolve(newBook);
            })
        })
    }
    //#endregion utility
}

export = bookController;