import Book from "../model/bookModel.js";
import catchAsync from "../utils/catchAsync.js";

const addBook = catchAsync(async (req, res) => {
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

  const book = await Book.create({
    id,
    authors,
    isbn,
    isbn13,
    original_publication_year,
    original_title,
    title,
    language_code,
  });
  res.json({
    message: "Book Created Successfully",
    book,
  });
});

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

export { addBook, deleteBook, editBook };
