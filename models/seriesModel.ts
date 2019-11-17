import mongoose, { Schema } from "mongoose";

export interface ISeries extends mongoose.Document {
    _id: String;
    _date: Date;
    title: String;
    title_lower: String;
    startDate?: Date;
    finishDate?: Date;
    rating?: Number;
    books: [String];
}

const SeriesSchema = new Schema({
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
    }
});

export default mongoose.model<ISeries>("Series", SeriesSchema);