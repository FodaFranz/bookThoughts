import mongoose, { Schema } from "mongoose";
import Notes, { INote } from "./noteModel";

export interface IBook extends mongoose.Document {
    _id: String;
    _lastModified: Date;
    _creationDate: Date;
    title: string;
    title_lower: String;
    subTitle?: String;
    subTitle_lower?: String;
    pageCount?: number;
    description?: String;
    description_lower?: String;
    authors: Object[];
    categories: [String];

    //Data not inside the json-Object from the google-api
    startDate?: Date;
    finishDate?: Date;
    rating?: number;
    state?: string;
    notes: [INote]
};

export const bookSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _lastModified: {
        type: Date,
        required: true
    },
    _creationDate: {
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
    subTitle: {
        type: String
    },
    subTitle_lower: {
        type: String
    },
    startDate: {
        type: Date
    },
    finishDate: {
        type: Date
    },
    categories: {
        type: Array
    },
    rating: {
        type: Number,
        min: -1, //-1 --> not yet rated
        max: 10
    },
    pageCount: {
        type: Number
    },
    description: {
        type: String
    },
    description_lower: {
        type: String
    },
    publishedDate: {
        type: Date
    },
    state: {
        enum: ["to-read", "read", "reading"],
        type: String
    },
    authors: {
        type: Array,
        name: { type: String },
        name_lower: { type: String }
    },
    notes: [Notes.schema]
});

export default mongoose.model<IBook>("Book", bookSchema);