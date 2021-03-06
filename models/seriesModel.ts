import mongoose, { Schema } from "mongoose";
import NoteSchema, { INote } from "./noteModel";

export interface ISeries extends mongoose.Document {
    _id: String;
    _creationDate: Date;
    _lastModified: Date;
    title: String;
    title_lower: String;
    startDate?: Date;
    finishDate?: Date;
    rating?: Number;
    books: [String];
    notes: [INote];
}

const seriesSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _creationDate: {
        type: Date,
        required: true
    },
    _lastModified: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    title_lower: {
        type: String,
        required: true
    },
    startDate: {
        type: Date
    },
    finishDate: {
        type: Date
    },
    rating: {
        type: Number,
        min: -1,
        max: 10
    },
    books: {
        type: Array
    },
    notes: [NoteSchema.schema]
});

export default mongoose.model<ISeries>("Series", seriesSchema);