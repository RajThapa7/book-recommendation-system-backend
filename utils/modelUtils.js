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
// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1, vec2) {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  let nonZeroCount1 = 0; // Count non-zero elements in vec1
  let nonZeroCount2 = 0; // Count non-zero elements in vec2

  for (let i = 0; i < vec1.length; i++) {
    const val1 = parseFloat(vec1[i].rating);
    const val2 = parseFloat(vec2[i]);

    if (!isNaN(val1) && !isNaN(val2)) {
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
      nonZeroCount1++;
      nonZeroCount2++;
    }
  }

  // Handle cases where one or both vectors have no non-zero elements
  if (nonZeroCount1 === 0 || nonZeroCount2 === 0) {
    return 0;
  }

  // Calculate magnitudes
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Calculate cosine similarity
  return dotProduct / (magnitude1 * magnitude2);
}

function getSimilarUsers(ratingData, targetUserId, numSimilarUsers = 2) {
  const targetUserRatings = ratingData.filter(
    (p) => p.user_id === targetUserId
  );
  const similarUsers = new Map();

  ratingData.forEach((rating) => {
    if (rating.user_id !== targetUserId) {
      // Filter ratings for the current user and parse to numbers
      const currentUserRatings = ratingData
        .filter((r) => r.user_id === rating.user_id)
        .map((r) => parseFloat(r.rating));
      const similarity = cosineSimilarity(
        Object.values(targetUserRatings), // Use original target ratings (no filtering)
        currentUserRatings
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
