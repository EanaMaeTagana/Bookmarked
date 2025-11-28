import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    apiBookId: String,
    title: String,
    author: String,
    cover: String,
    status: String,
    notes: String,
    rating: Number,
    dateAdded: { type: Date, default: Date.now },
});

export default mongoose.model("Book", bookSchema);
