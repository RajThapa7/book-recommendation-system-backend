import mongoose from "mongoose";
import List from "../model/listModel.js";
import catchAsync from "../utils/catchAsync.js";

const addBookToList = catchAsync(async (req, res) => {
  const { userId, bookId } = req.body;

  // Try to find an existing document with the same user_id
  const existingList = await List.findOne({ user_id: userId });

  if (existingList) {
    // If the document already exists, update the array by pushing the new book_id
    const updatedList = await List.findOneAndUpdate(
      { user_id: userId },
      { $addToSet: { books: bookId } }, // Using $addToSet to avoid duplicate entries
      { new: true, fields: "-__v" }
    );
    res.json({ message: "Book added to list successfully", list: updatedList });
  } else {
    // If no document is found, create a new one
    const newList = await List.create({ user_id: userId, books: [bookId] });
    res.json({
      message: "Book added to list successfully",
      list: newList,
    });
  }
});

const getUserBookList = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const booklist = await List.findOne(
    { user_id: userId },
    "-user_id -_id -__v"
  ).populate("books");
  res.json(booklist);
});

const removeBookFromList = catchAsync(async (req, res) => {
  const { userId, bookId } = req.params;
  const list = await List.findOne({ user_id: userId });

  if (list.books.length === 0) {
    return res.json({ message: "You have no books in the list" });
  }

  //finds the list for the given userId and removes the bookId from the books array that matches the bookId
  await List.findOneAndUpdate(
    { user_id: userId },
    { $pull: { books: { $in: [new mongoose.Types.ObjectId(bookId)] } } }
  ).then(() => {
    res.json({ message: "Removed Successfully" });
  });
});

const checkIfBookIsInList = catchAsync(async (req, res) => {
  const { userId, bookId } = req.params;

  const list = await List.findOne({
    user_id: userId,
    books: { $in: [new mongoose.Types.ObjectId(bookId)] },
  });

  if (list !== null) {
    return res.json({ status: true, message: "Book is present in the list" });
  }
  res.json({ status: false, message: "Book is not present in the list" });
});

export {
  addBookToList,
  checkIfBookIsInList,
  getUserBookList,
  removeBookFromList,
};
