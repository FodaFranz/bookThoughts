import express from "express";
import mongoose from "mongoose";
import Notes, { INote } from "../models/noteModel";

class noteController {
    getAll(req: express.Request, res: express.Response) {
        Notes.find({}, (err: Error, result: INote[]) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else 
                res.status(200).json(result);
        });
    }

    add(req: express.Request, res: express.Response) {
        
    }
}

export = noteController;