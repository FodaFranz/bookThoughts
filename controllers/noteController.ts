import express from "express";
import mongoose from "mongoose";
import Note, { INote } from "../models/noteModel";
import Series, { ISeries } from "../models/seriesModel";
import Books, { IBook } from "../models/bookModel";

class noteController {
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

    //#region add
    private addToBook(note: INote, bookId: any) {
        return new Promise((resolve, reject) => {
            Books.update({ _id: mongoose.Types.ObjectId(bookId) },
                { $addToSet: { notes: note } },
                (err: Error, result: any) => {
                    if (err) reject(err);

                    console.log(result);
                    resolve(result);
                }
            )
        })
    }

    private addToSeries(note: INote, seriesId: any) {
        return new Promise((resolve, reject) => {
            Series.update({ _id: mongoose.Types.ObjectId(seriesId) },
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
}

export = noteController;