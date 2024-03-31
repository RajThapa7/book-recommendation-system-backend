function customTokenizer(text) {
  return text.toLowerCase().split(/\s+/);
}
function cosineSimilarity(vec1, vec2) {
  const vec1Tokens = customTokenizer(vec1.toLowerCase());
  const vec2Tokens = customTokenizer(vec2.toLowerCase());
  const vec1Set = new Set(vec1Tokens);
  const vec2Set = new Set(vec2Tokens);
  const intersection = [...vec1Set].filter((token) =>
    vec2Set.has(token)
  ).length;
  const mag1 = Math.sqrt(vec1Tokens.length);
  const mag2 = Math.sqrt(vec2Tokens.length);

  return intersection / (mag1 * mag2);
}
export function cosineRecommendBooks(books, userSaveLists) {
  const recommendations = [];
  for (const save of userSaveLists) {
    for (const book of books) {
      let authorSimilarity = 0;
      if (save.isbn !== book.isbn) {
        const titleSimilarity = cosineSimilarity(save.title, book.title);
        if (book.author && save.author) {
          authorSimilarity = cosineSimilarity(save.author, book.author);
        }
        if (book.authors && save.authors) {
          authorSimilarity = cosineSimilarity(save.authors, book.authors);
        }
        if (!book.authors && save.authors) {
          authorSimilarity = cosineSimilarity(save.authors, book.author);
        }
        if (book.authors && !save.authors) {
          authorSimilarity = cosineSimilarity(save.author, book.authors);
        }
        const similarity = (titleSimilarity + authorSimilarity) / 2;
        recommendations.push({
          book: book,
          similarity: similarity.toFixed(2),
        });
      }
    }
  }
  recommendations.sort((a, b) => b.similarity - a.similarity);
  return recommendations.slice(0, 10);
}
