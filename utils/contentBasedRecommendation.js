import Book from "../model/bookModel.js";
import ApiFeatures from "./ApiFeatures.js";

const similarity = (s1, s2) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  let longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
};

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  let costs = new Array();
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

const recommendRelatedBooks = async (author, title, req) => {
  let page = (req.query.page >= 1 ? req.query.page : 1) - 1;
  const resultsPerPage = 10;

  const bookQuery = Book.find();
  const books = await ApiFeatures(bookQuery, req);
  //   const books = await Book.find();

  const similarBooks = [];

  for (const book of books.data) {
    const titleSimilarity = similarity(book.title, title);
    const authorSimilarity = similarity(book.authors, author);
    const similarityScore = (titleSimilarity + authorSimilarity) / 2;
    similarBooks.push({ similarityScore, book });
  }

  similarBooks.sort((a, b) => b.similarityScore - a.similarityScore);

  console.log(page, "pge");

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
};

export { recommendRelatedBooks };
