import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  book_id: {
    type: Number,
  },
  books_count: {
    type: Number,
  },
  isbn: {
    type: Number,
  },
  isbn13: {
    type: Number,
  },
  authors: {
    type: String,
  },
  original_publication_year: {
    type: String,
  },
  original_title: {
    type: String,
  },
  title: {
    type: String,
  },
  language_code: {
    type: String,
  },
  average_rating: {
    type: Number,
  },
  ratings_count: {
    type: Number,
  },
  ratings_1: {
    type: Number,
  },
  ratings_2: {
    type: Number,
  },
  ratings_3: {
    type: Number,
  },
  ratings_4: {
    type: Number,
  },
  ratings_5: {
    type: Number,
  },
  image_url: {
    type: String,
  },
  small_image_url: {
    type: String,
  },
});

//defines a pre-hook to exclude what fields to exclude from the documents while using find and findOne queries
bookSchema.pre(["find", "findOne"], function () {
  this.select(
    "-book_id -work_id -best_book_id -work_ratings_count -work_text_reviews_count -books_count"
  );
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
