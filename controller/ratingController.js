import Rating from "../model/ratingModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import catchAsync from "../utils/catchAsync.js";

const getAllRatingsOnBook = catchAsync(async (req, res) => {
  const { bookId, userId } = req.params;
  const query = Rating.find({ book_id: bookId });
  const result = await ApiFeatures(query, req);

  const totalData = await Rating.find({ book_id: bookId });

  const ratingCount = [0, 0, 0, 0, 0];
  let totalRating = 0;
  let currentUserRating = null;
  totalData.forEach(({ rating, user_id }) => {
    if (parseInt(userId) === user_id) {
      currentUserRating = rating;
    }
    totalRating += rating;
    ratingCount[rating - 1]++;
  });
  const average_rating = totalRating / totalData.length;

  res.json({ currentUserRating, average_rating, ratingCount, ...result });
});

const getUserRatingOnBook = catchAsync(async (req, res) => {
  const { bookId, userId } = req.params;
  const result = await Rating.findOne({ book_id: bookId, user_id: userId });

  if (result === null) {
    res.json({
      status: false,
      message: "This book is yet to be rated by the user",
    });
  }
  res.json({ status: true, rating: result.rating });
});

const addUserRatingOnBook = catchAsync(async (req, res) => {
  const { rating, bookId, userId } = req.body;
  const existingRating = await Rating.findOne({
    book_id: bookId,
    user_id: userId,
  });

  if (existingRating) {
    const result = await Rating.findOneAndUpdate({ rating });
    res.json({
      message: "Ratings updated successfully",
      rating: result.rating,
    });
  } else {
    const result = await Rating.create({
      book_id: bookId,
      user_id: userId,
      rating,
    });
    res.json({ message: "Ratings added successfully", rating: result.rating });
  }
});

const deleteUserRatingOnBook = catchAsync(async (req, res) => {
  const { bookId, userId } = req.body;
  await Rating.deleteOne({
    book_id: bookId,
    user_id: userId,
  });
  res.json({ message: "Ratings removed successfully" });
});

export {
  addUserRatingOnBook,
  deleteUserRatingOnBook,
  getAllRatingsOnBook,
  getUserRatingOnBook,
};
