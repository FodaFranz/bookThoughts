//TODO: Notes

import mongoose, { Schema } from "mongoose";

export interface IBook extends mongoose.Document {
    _id: String;
    _date: Date;
    title: string;
    title_lower: String;
    subTitle?: String;
    subTitle_lower?: String;
    startDate?: Date;
    finishDate?: Date;
    categories?: [String];
    rating?: number;
    pageCount?: number;
    description?: String;
    description_lower?: String;
    publishedDate?: Date;
    currentPage?: Number;
    state?: string;
    authors: Object[];
};

export const BookSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _date: {
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
    currentPage: {
        type: Number
    },
    state: {
        enum: ["to-read", "read", "reading"],
        type: String
    },
    authors: {
        type: Array,
        name: { type: String },
        name_lower: { type: String }
    }
});

export default mongoose.model<IBook>("Book", BookSchema);