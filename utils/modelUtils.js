import * as tf from "@tensorflow/tfjs-node";
import Book from "../model/bookModel.js";

async function loadModel() {
  try {
    const modelPath = "trained_model/model.json";
    const handler = tf.io.fileSystem(modelPath);
    const model = await tf.loadLayersModel(handler);
    return model;
  } catch (error) {
    console.log(error, "error loading the model");
  }
}

async function makeRecommendations(userId) {
  const model = await loadModel();

  //returns an array containing unique id from each document of the collection
  const books_id = await Book.distinct("id");
  const bookCSVLength = books_id.length;

  //create array of equal length as bookCSV for given userId
  const user_id = Array.from({ length: bookCSVLength }).fill(parseInt(userId));

  //create tensor from the array
  const userTensor = tf.tensor2d(user_id, [bookCSVLength, 1]);
  const bookTensor = tf.tensor2d(books_id, [bookCSVLength, 1]);

  //use the model for prediction
  const recommendations = model.predict([userTensor, bookTensor]);
  //returns a 2D array from the tensor value
  return recommendations.arraySync();
}
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  return dotProduct / (magnitude1 * magnitude2);
}

// Collaborative Filtering: Get top N similar users to the target user
function getSimilarUsers(ratingData, targetUserId, numSimilarUsers = 2) {
  const targetUserRatings = ratingData.filter(
    (rating) => rating.user_id === targetUserId
  );
  const similarUsers = new Map();
  ratingData.forEach((rating) => {
    if (rating.user_id !== targetUserId) {
      const similarity = cosineSimilarity(
        Object.values(targetUserRatings).map((rating) =>
          parseFloat(rating.rating)
        ),
        Object.values(rating)
          .slice(2)
          .map((rating) => parseFloat(rating.rating)) // Ratings of the current user
      );

      if (!similarUsers.has(rating.user_id)) {
        similarUsers.set(rating.user_id, []);
      }

      similarUsers.get(rating.user_id).push(similarity);
    }
  });
  const averageSimilarities = [];
  similarUsers.forEach((similarities, userId) => {
    const averageSimilarity =
      similarities.reduce((acc, val) => acc + val, 0) / similarities.length;
    averageSimilarities.push({ userId, similarity: averageSimilarity });
  });
  averageSimilarities.sort((a, b) => b.similarity - a.similarity);
  return averageSimilarities.slice(0, numSimilarUsers);
}

function getSimilarBooks(booksData, userLikedBooks, numSimilarBooks = 10) {
  const likedBookAuthors = new Set();
  userLikedBooks.forEach((bookId) => {
    const book = booksData.find((book) => book.id === bookId);
    if (book) {
      likedBookAuthors.add(book.authors);
    }
  });

  const similarBooks = booksData.filter(
    (book) =>
      !likedBookAuthors.has(book.authors) &&
      userLikedBooks.indexOf(book.id) === -1
  );
  return similarBooks.slice(0, numSimilarBooks).map((book) => book.id);
}
function hybridRecommendation(
  userId,
  booksData,
  ratingData,
  numRecommendations = 10
) {
  const similarUsers = getSimilarUsers(ratingData, userId);
  const userLikedBooks = ratingData
    .filter((rating) =>
      similarUsers.some(
        (user) => user.userId === rating.user_id && rating.rating >= 4
      )
    )
    .map((rating) => rating.book_id);

  const recommendationsFromContentBased = getSimilarBooks(
    booksData,
    userLikedBooks
  );
  const combinedRecommendations = Array.from(
    new Set([...recommendationsFromContentBased])
  );
  const recommendedBooks = combinedRecommendations
    .slice(0, numRecommendations)
    .map((id) => booksData.find((book) => book.id === id));

  return recommendedBooks;
}

export { loadModel, makeRecommendations, hybridRecommendation };
