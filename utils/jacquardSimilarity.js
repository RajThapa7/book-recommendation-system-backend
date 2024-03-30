import Book from "../model/bookModel.js";

// Function to calculate similarity between two books based on multiple features
function calculateSimilarity(book1, book2) {
  const titleSimilarity = calculateJacquardSimilarity(book1.title, book2.title);
  const authorSimilarity = calculateJacquardSimilarity(
    book1.authors,
    book2.authors
  );
  const combinedSimilarity = (titleSimilarity + authorSimilarity) / 2; // Simple average in this case
  return combinedSimilarity;
}

// Function to calculate Jacquard similarity between two strings
function calculateJacquardSimilarity(str1, str2) {
  const set1 = new Set(str1.split(" "));
  const set2 = new Set(str2.split(" "));
  const intersection = new Set(
    [...set1].filter((element) => set2.has(element))
  );
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

async function suggestBooksFromArray(userBooks, req) {
  let page = (req.query.page >= 1 ? req.query.page : 1) - 1;
  const resultsPerPage = req.query.limit || 10;
  // Find similar books based on user's books
  const similarBooks = [];

  const booksData = await Book.find();

  booksData.forEach((otherBook) => {
    const similarities = userBooks.map((userBookFeature) => {
      const similarityScore = calculateSimilarity(userBookFeature, otherBook);
      return similarityScore;
    });

    const averageSimilarity =
      similarities.reduce((acc, val) => acc + val, 0) / similarities.length;
    similarBooks.push({
      ...otherBook.toObject(),
      averageSimilarity,
    });
  });
  similarBooks.sort((a, b) => b.averageSimilarity - a.averageSimilarity);

  const result = {
    totalCount: similarBooks.length,
    totalPages: Math.ceil(similarBooks.length / resultsPerPage),
    count: resultsPerPage,
    page: page + 1,
    data: similarBooks.slice(
      resultsPerPage * page,
      resultsPerPage * (page + 1)
    ),
  };

  return result;
}

export { suggestBooksFromArray };
