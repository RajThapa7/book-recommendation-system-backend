import Book from "../model/bookModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import { recommendRelatedBooks } from "../utils/contentBasedRecommendation.js";
import { cosineRecommendBooks } from "../utils/cosine-similarity.js";
import { suggestBooksFromArray } from "../utils/jacquardSimilarity.js";
import { makeRecommendations } from "../utils/modelUtils.js";

// get recommendation based on array of books using jacquard algorithm
const getBookRecommendationForSavedList = catchAsync(async (req, res) => {
  const { books } = req.body;
  const recommendations = await suggestBooksFromArray(books, req);
  res.json(recommendations);
});

// get books related to a single book
const getRelatedBooks = catchAsync(async (req, res) => {
  const { title, author } = req.body;
  const relatedBooks = await recommendRelatedBooks(author, title, req);
  res.json(relatedBooks);
});

//recommendation based on array of book using cosine similarity
const getRelatedBooksFromSavedListCosineSimilarity = catchAsync(
  async (req, res) => {
    const { list } = req.body;
    const books = await Book.find();
    res.json({
      list: cosineRecommendBooks(books, list, req),
    });
  }
);

const getBookRecommendation = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const recommendations = await makeRecommendations(userId);

  const limit = req.query.limit || 10;

  //converts the 2D array into 1D array
  const recommendedBookId = recommendations.flat();

  //sort the recommendedBookId in descending order and get the sorted indices array: similar to arr.argsort() of numpy
  const recommendedBookIdSorted = recommendedBookId
    .map((_, index) => index)
    .sort(function (a, b) {
      if (recommendedBookId[a] < recommendedBookId[b]) {
        return 1;
      } else if (recommendedBookId[a] > recommendedBookId[b]) {
        return -1;
      } else {
        return 0;
      }
    })
    .slice(0, limit);

  //returns the book list whose id is contained in the recommendedBookIdSorted array
  const bookList = await Book.find({ id: recommendedBookIdSorted });

  //sorts the booklist based on the ordering of recommendedBookIdSorted
  const books = recommendedBookIdSorted.map((bookId) =>
    bookList.find((book) => book.id === bookId)
  );

  res.json({
    count: parseInt(limit),
    data: books,
  });
});

const getAllBookList = catchAsync(async (req, res) => {
  //if using pagination just define the query don't call await
  const bookQuery = Book.find();
  const result = await ApiFeatures(bookQuery, req);
  res.json(result);
});

const getBookById = catchAsync(async (req, res) => {
  const bookId = req.params.bookId;
  const book = await Book.findById(bookId);
  res.json({ data: book });
});

const searchBookList = catchAsync(async (req, res) => {
  const searchTerm = req.query.search;
  //search book list based on the search term that matches either the title or author of the book
  const bookQuery = Book.find({
    $or: [
      {
        title: { $regex: searchTerm, $options: "i" },
      },
      {
        authors: { $regex: searchTerm, $options: "i" },
      },
    ],
  });

  const result = await ApiFeatures(bookQuery, req);

  res.json(result);
});

export {
  getAllBookList,
  getBookById,
  getBookRecommendation,
  getBookRecommendationForSavedList,
  getRelatedBooks,
  getRelatedBooksFromSavedListCosineSimilarity,
  searchBookList,
};
