import express from "express";
import Series, { ISeries } from "../models/seriesModel";
import mongoose from "mongoose";

class seriesController {
    getAll(req: express.Request, res: express.Response) {
        Series.find({}, (err: Error,  series: ISeries[]) => {
            if(err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                res.status(200).json(series);
            }
        })
    }

    get(req: express.Request, res: express.Response) {
        this.getById(req.params.id)
            .then(series => res.status(200).json(series))
            .catch(err => {
                console.log(err);
                res.status(500).send(err.message);
            })
    }

    add(req: express.Request, res: express.Response) {
        let series: ISeries = new Series({
            _id: mongoose.Types.ObjectId(),
            _creationDate: new Date(),
            _lastModified: new Date(),
            title: req.body.title,
            title_lower: req.body.title === undefined ? undefined : req.body.title.toLowerCase(),
            startDate: req.body.startDate,
            finishDate: req.body.finishDate,
            rating: req.body.rating || -1,
            books: []
        });
        
        series.save((err: Error, result: ISeries) => {
            if(err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                res.status(200).json(series);
            }
        })
    }

    delete(req: express.Request, res: express.Response) {
        const id: String = req.params.id;

        Series.findOneAndDelete({_id: id}, (err: Error, result: ISeries | null) => {
            if(err) {
                console.log(err);
                res.status(500).send(err.message);
            }
            else {
                if (result === null) {
                    res.status(404).send(`${id} does not exist`);
                }
                else {
                    res.status(200).json(result);                    
                }
            }
        })
    }

    edit(req: express.Request, res: express.Response) {
        let newSeries: ISeries = new Series({
            _id: req.params.id,
            title: req.body.title,
            title_lower: req.body.title === undefined ? undefined : req.body.title.toLowerCase(),
            startDate: req.body.startDate,
            finishDate: req.body.finishDate,
            rating: req.body.rating
        });

        this.getById(req.params.id)
            .then(series => {
                if(newSeries.title === undefined) {
                    newSeries.title = series.title
                    newSeries.title_lower = series.title_lower;
                }

                if(newSeries.startDate === undefined) newSeries.startDate = series.startDate;
                if(newSeries.finishDate === undefined) newSeries.finishDate = series.finishDate;
                if(newSeries.rating === undefined) newSeries.rating = series.rating;

                this.replaceSeries(req.params.id, newSeries) 
                    .then(newSeries => res.status(200).send(newSeries))
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

    addBook(req: express.Request, res: express.Response) {
        Series.update({ _id: mongoose.Types.ObjectId(req.params.id) },
            { $addToSet: { books: req.body.bookIds } },
            (err: Error, raw: any) => {
                if(err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                else {
                    if(raw.nModified != 0) {
                        res.status(200).send("Successfully added books to series.");
                    }
                }
            }
        );
    }   

    removeBooks(req: express.Request, res: express.Response) {
        Series.update({ _id: mongoose.Types.ObjectId(req.params.id) }, 
            { $pullAll: { "books": req.body.bookIds as String[] } },
            (err: Error, raw: any) => {
                if(err) {
                    console.log(err);
                    res.status(500).send(err);
                }
                else {
                    if(raw.nModified != 0) {
                        res.status(200).send(`Removed ${req.body.bookIds}`);
                    }
                    else {
                        res.status(404).send(`Couldn't find ${req.body.bookIds}`);
                    }
                }
            }
        );

    }

    getBooks(req: express.Request, res: express.Response) {
        Series.findOne({ _id: req.params.id }, "books", (err: Error, result: any) => {
            if(err) {
                console.log(err);
                res.status(500).send(err);
            }
            else {
                res.json(result.books);
            }
        });
    }

    //#region utility
    replaceSeries(id: String, newSeries: ISeries) {
        return new Promise<ISeries>((resolve, reject) => {
            Series.replaceOne({_id: id}, newSeries, (err: Error, result: any) => {
                if(err) 
                    reject(err);
                else 
                    resolve(newSeries);
            })
        });
        
    }

    getById(id: String) {
        return new Promise<ISeries>((resolve, reject) => {
            Series.findById(id, (err: Error, series: ISeries) => {
                if(err) 
                    reject(err);
                else 
                    if(series === null)
                        reject(new Error(`Series ${id} not found`));
                    else
                        resolve(series);
            });
        });
    }
    //#endregion
}

export = seriesController;