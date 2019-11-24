import express from "express";
import mongoose from "mongoose";
import Note, { INote } from "../models/noteModel";
import Series, { ISeries } from "../models/seriesModel";
import Books, { IBook } from "../models/bookModel";
import SeriesController from "./seriesController";
import BookController from "./bookController";

class noteController {
    seriesController: SeriesController = new SeriesController();
    bookController: BookController = new BookController();

    getAll(req: express.Request, res: express.Response) {
        Note.find({}, (err: Error, result: INote[]) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else 
                res.status(200).json(result);
        });
    }

    add(req: express.Request, res: express.Response) {
        let note: INote = new Note({
            _id: mongoose.Types.ObjectId(),
            _lastModified: new Date(),
            content: req.body.content || "",
            content_lower: req.body.content === undefined ? "" : req.body.content.toLowerCase(),
            header: req.body.header || "",
            header_lower: req.body.header === undefined ? "" : req.body.header.toLowerCase()
        });
        
        if(req.baseUrl.includes("book")) {
            this.addToBook(note, req.params.id)
                .then(result => res.status(200).json(result))
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err);
                })
        }
        else if(req.baseUrl.includes("series")) {
            this.addToSeries(note, req.params.id)
            .then(result => res.status(200).json(result))
            .catch(err => {
                console.log(err);
                res.status(500).send(err);
            })
        }
    }

    edit(req: express.Request, res: express.Response) {
        const newNote: INote = new Note({
            _id: req.body._id,
            content: req.body.content,
            content_lower: req.body.content.toLowerCase(),
            header: req.body.header,
            header_lower: req.body.header.toLowerCase(),
            _lastModified: new Date()
        });

        if(req.baseUrl.includes("book")) {
            this.editBook(newNote, req.params.id)
            .then(result => res.status(200).json(result))
            .catch(err =>  {
                console.log(err);
                res.status(500).send(err);
            });
        }
        else if(req.baseUrl.includes("series")) {
          this.editSeries(newNote, req.params.id)
            .then(result => res.status(200).json(result))
            .catch(err =>  {
                console.log(err);
                res.status(500).send(err);
            });
        }
    }

    delete(req: express.Request, res: express.Response) {
        const noteId: String = req.body._id;
        const parentId: String = req.params.id;

        if(req.baseUrl.includes("book")) {
            this.deleteNoteInBook(parentId, noteId)
                .then(result => res.status(200).json(result))
                .catch(err =>  {
                    console.log(err);
                    res.status(500).send(err);
                });
        }
        else if(req.baseUrl.includes("series")) {
          this.deleteNoteInSeries(parentId, noteId)
            .then(result => res.status(200).json(result))
            .catch(err =>  {
                console.log(err);
                res.status(500).send(err);
            });
        }
    }

    //#region add
    private addToBook(note: INote, id: any) {
        return new Promise((resolve, reject) => {
            Books.update({ _id: mongoose.Types.ObjectId(id) },
                { $addToSet: { notes: note } },
                (err: Error, result: any) => {
                    if (err) reject(err);

                    console.log(result);
                    resolve(result);
                }
            )
        })
    }

    private addToSeries(note: INote, id: any) {
        return new Promise((resolve, reject) => {
            Series.update({ _id: mongoose.Types.ObjectId(id) },
                { $addToSet: { notes: note } },
                (err: Error, result: any) => {
                    if (err) reject(err);

                    console.log(result);
                    resolve(result);
                }
            )
        })
    }
    //#endregion add

    //#region edit
    editSeries(newNote: INote, id: String){
        return new Promise((resolve, reject) => {
            this.seriesController.getById(id)
                .then(series => {
                    series.notes.forEach((note, i) => {
                        console.log(note._id + " " + newNote._id);
                        if(note._id.toString() == newNote._id.toString()) {
                            series.notes[i] = newNote;
                        }

                        if(i == series.notes.length -1 ) {
                            this.seriesController.replaceSeries(id, series)
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                        }
                    })
                })
                .catch(err => reject(err));
        })
    }

    editBook(newNote: INote, id: String){
        return new Promise((resolve, reject) => {
            this.bookController.getById(id)
                .then(book => {
                    book.notes.forEach((note, i) => {
                        console.log(note._id + " " + newNote._id);
                        if(note._id.toString() == newNote._id.toString()) {
                            book.notes[i] = newNote;
                        }

                        if(i == book.notes.length -1 ) {
                            this.bookController.replaceBook(id, book)
                                .then(result => resolve(result))
                                .catch(err => reject(err));
                        }
                    })
                })
                .catch(err => reject(err));
        })
    }
    //#endregion edit

    //#region delete
    deleteNoteInSeries(seriesId: String, noteId: String) {
        return new Promise((resolve, reject) => {
            this.seriesController.getById(seriesId)
            .then(series => {
                series.notes.forEach((note, i) => {
                    if(note._id.toString() === noteId){
                        series.notes.splice(i, 1);

                        this.seriesController.replaceSeries(seriesId, series)
                            .then(result => resolve(result))
                            .catch(err => reject(err));
                    }

                    if(i === series.notes.length - 1)
                        reject(new Error(`${noteId} not found`));
                })
            })
            .catch(err => reject(err));
        })
    }
    
    deleteNoteInBook(bookId: String, noteId: String) {
        return new Promise((resolve, reject) => {
            this.bookController.getById(bookId)
            .then(book => {
                book.notes.forEach((note, i) => {
                    if(note._id.toString() === noteId){
                        book.notes.splice(i, 1);

                        this.bookController.replaceBook(bookId, book)
                            .then(result => resolve(result))
                            .catch(err => reject(err));
                    }

                    if(i === book.notes.length - 1)
                        reject(new Error(`${noteId} not found`));
                })
            })
            .catch(err => reject(err));
        })
    }
    //#endregion delete
}

export = noteController;