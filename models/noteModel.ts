import mongoose, { Schema } from "mongoose";

export interface INote extends mongoose.Document {
    _id: String;
    _lastModified: Date;
    _creationDate: Date;
    content: String;
    content_lower: String;
    header: String;
    header_lower: String;
}

const noteSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _lastModified: {
        type: Date
    },
    _creationDate: {
        type: Date,
        required: true
    },
    content: {
        type: String
    },
    content_lower: {
        type: String
    },
    header: {
        type: String,
        required: true
    },
    header_lower: {
        type: String,
        required: true
    }
})

export default mongoose.model<INote>("Note", noteSchema);