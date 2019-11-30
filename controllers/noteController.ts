import express from "express";
import mongoose from "mongoose";
import Note, { INote } from "../models/noteModel";
import Series from "../models/seriesModel";
import Books, { IBook } from "../models/bookModel";
import SeriesController from "./seriesController";
import BookController from "./bookController";

class noteController {
    seriesController: SeriesController = new SeriesController();
    bookController: BookController = new BookController();

    getAll(req: express.Request, res: express.Response) {
        if(req.baseUrl.includes("book")) {
            this.bookController.getById(req.params.parentId)
                .then(book => {
                    res.status(200).json(book.notes);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message);
                })
        }
        else if(req.baseUrl.includes("series")) {
            this.seriesController.getById(req.params.parentId)
                .then(series => {
                    res.status(200).json(series.notes);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message);
                })
        }
    }

    get(req: express.Request, res: express.Response) {
        if(req.baseUrl.includes("book")) {
            this.getByIdFromBook(req.params.id, req.params.parentId)
                .then(note => res.status(200).send(note))
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message);
                })
        }
        else if(req.baseUrl.includes("series")) {
            this.getByIdFromSeroes(req.params.id, req.params.parentId)
                .then(note => res.status(200).send(note))
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message);
                })
        }
    }

    //#region add
    add(req: express.Request, res: express.Response) {
        let note: INote = new Note({
            _id: mongoose.Types.ObjectId(),
            _lastModified: new Date(),
            _creationDate: new Date(),
            content: req.body.content || "",
            content_lower: req.body.content === undefined ? "" : req.body.content.toLowerCase(),
            header: req.body.header || "",
            header_lower: req.body.header === undefined ? "" : req.body.header.toLowerCase()
        });
        
        if(req.baseUrl.includes("book")) {
            this.addToBook(note, req.params.id)
                .then(note => this.save(note))
                .then(savedNote => res.status(200).json(savedNote))
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message)
                })
        }
        else if(req.baseUrl.includes("series")) {
            this.addToSeries(note, req.params.id)
                .then(note => this.save(note))
                .then(savedNote => res.status(200).json(savedNote))
                .catch(err => {
                    console.log(err);
                    res.status(500).send(err.message)
                })
        }
    }

    private save(note: INote): Promise<INote> {
        return new Promise<INote>((resolve, reject) => {
            note.save((err: Error, note: INote) => {
                if(err)
                    reject(err);
                else 
                    resolve(note);
            })
        })
    }

    private addToBook(note: INote, id: any): Promise<INote> {
        return new Promise<INote>((resolve, reject) => {
            Books.update({ _id: mongoose.Types.ObjectId(id) },
                { $addToSet: { notes: note } },
                (err: Error, result: any) => {
                    if (err) reject(err);

                    if(result.nModified == 0) reject(new Error("Book not found"));

                    resolve(note);
                }
            )
        })
    }

    private addToSeries(note: INote, id: any): Promise<INote>  {
        return new Promise<INote>((resolve, reject) => {
            Series.update({ _id: mongoose.Types.ObjectId(id) },
                { $addToSet: { notes: note } },
                (err: Error, result: any) => {
                    if (err) reject(err);
                    else {
                        if (result.nModified == 0)
                            reject(new Error("Series not found"));
                        else
                            resolve(note);
                    }
                }
            )
        })
    }
    //#endregion add

    //#region edit
    edit(req: express.Request, res: express.Response) {
        const id: String = req.params.id;
        const parentId: String = req.params.parentId;

        const newNote: INote = new Note({
            _id: id,
            content: req.body.content,
            content_lower: req.body.content.toLowerCase(),
            header: req.body.header,
            header_lower: req.body.header.toLowerCase(),
            _lastModified: new Date()
        });

        if(req.baseUrl.includes("book")) {
            this.editNote(newNote)
                .then(note => this.editBook(note, parentId))
                .then(result => res.status(200).json(result))
                .catch(err =>  {
                    console.log(err);
                    res.status(500).send(err.message);
                });
        }
        else if(req.baseUrl.includes("series")) {
            this.editNote(newNote)
                .then(note => this.editSeries(note, parentId))
                .then(result => res.status(200).json(result))
                .catch(err =>  {
                    console.log(err);
                    res.status(500).send(err.message);
                });
        }
    }

    editNote(note: INote): Promise<INote> {
        const checkNotePromise = new Promise<INote>((resolve, reject) => {
            Note.findById(note._id, (err: Error, oldNote: INote) => {
                if(err) reject(err);
                else {
                    if(oldNote == null) reject(new Error(`Note ${note._id} not found`));
                    else {
                        if(note._id === undefined) note._id = oldNote._id;
                        if(note.content === undefined) {
                            note.content = oldNote.content;
                            note.content_lower = note.content.toLowerCase();
                        } 

                        if(note.header === undefined) { 
                            note.header = oldNote.header; 
                            note.header_lower = note.header.toLowerCase();
                        }

                        resolve(note);
                    }
                }
            })
        });

        return new Promise<INote>((resolve, reject) => {
            checkNotePromise.then(newNote => {
                Note.replaceOne({ _id: note._id.toString() }, newNote, (err: Error, result: any) => {
                    if(err) reject(err);
                    else {
                        if(result.nModified == 0) 
                            reject(new Error(`Note ${note._id} not found`));
                        else   
                            resolve(newNote);
                    }
                })
            }).catch(err => reject(err));
        });
    }

    editSeries(newNote: INote, id: String){
        return new Promise((resolve, reject) => {
            this.seriesController.getById(id)
                .then(series => {
                    series.notes[series.notes.findIndex(x => x._id === newNote._id)] = newNote;
                    this.seriesController.replaceSeries(id, series)
                        .then(result => resolve(newNote))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        })
    }

    editBook(newNote: INote, id: String){
        return new Promise((resolve, reject) => {
            this.bookController.getById(id)
                .then(book => {
                    book.notes[book.notes.findIndex(x => x._id === newNote._id)] = newNote;
                    this.bookController.replaceBook(id, book)
                        .then(result => resolve(newNote))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        })
    }
    //#endregion edit

    //#region delete
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

    getByIdFromBook(id: String, bookId: String) {
        return new Promise<INote>((resolve, reject) => {
            this.bookController.getById(bookId)
            .then(book => {
                let note: INote | undefined = book.notes.find(x => x._id == id) || undefined;
                if(note === undefined) 
                    reject(new Error(`Note ${id} not found`))
                else
                    resolve(note);
            })
            .catch(err => reject(err));
        })
    }

    getByIdFromSeroes(id: String, seriesId: String) {
        return new Promise<INote>((resolve, reject) => {
            this.seriesController.getById(seriesId)
            .then(series => {
                let note: INote | undefined = series.notes.find(x => x._id == id) || undefined;
                if(note === undefined) 
                    reject(new Error(`Note ${id} not found`))
                else
                    resolve(note);
            })
            .catch(err => reject(err));
        })
    }
}

export = noteController;