import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  book_id: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
