import Book from "../model/bookModel.js";
import User from "../model/userModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import { deleteImageFromCloud, imageUpload } from "../utils/cloudinary.js";

const addBook = async (req, res, next) => {
  const {
    id,
    authors,
    original_publication_year,
    original_title,
    title,
    language_code,
    isbn,
    isbn13,
  } = req.body;
  if (!req.files)
    return res.status(400).json({ message: "Please Upload an image" });

  const cloudFile = await imageUpload(req, res);

  try {
    const book = await Book.create({
      id,
      authors,
      isbn,
      isbn13,
      original_publication_year,
      original_title,
      title,
      language_code,
      image_url: cloudFile,
    });
    res.json({
      message: "Book Created Successfully",
      book,
    });
  } catch (error) {
    await deleteImageFromCloud(cloudFile);
    next(error);
  }
};

const editBook = catchAsync(async (req, res) => {
  const {
    bookId,
    authors,
    original_publication_year,
    original_title,
    title,
    language_code,
    isbn,
    isbn13,
  } = req.body;

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(400).json({ message: "No book found of the given id" });
  }
  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    {
      authors,
      original_publication_year,
      original_title,
      original_publication_year,
      title,
      language_code,
      isbn,
      isbn13,
      authors,
    },
    { new: true }
  );
  res.json({ message: "Book Updated Successfully", book: updatedBook });
});

const deleteBook = catchAsync(async (req, res) => {
  const { bookId } = req.params;

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(400).json({ message: "No book found of the given id" });
  }
  await Book.findByIdAndDelete(bookId);
  res.json({ message: "Book Deleted Successfully", book });
});

const getAllUsers = catchAsync(async (req, res) => {
  const query = User.find();
  const result = await ApiFeatures(query, req);
  res.json(result);
});

export { addBook, deleteBook, editBook, getAllUsers };
