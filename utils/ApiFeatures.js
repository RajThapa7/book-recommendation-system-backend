const getFilterQuery = (queryObj) => {
  // exclude fields to filter
  const excludedFields = ["sort", "page", "limit", "order", "search"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  const mappingObj = {
    "<": "lt:",
    "<=": "lte:",
    ">": "gt:",
    ">=": "gte:",
    "=": "eq:",
  };
  queryStr = queryStr.replace(/(>(=)?|<(=)?)|=/g, (match) => mappingObj[match]);
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|eq|search)\b/g,
    (match) => `$${match}`
  );

  const parsed = JSON.parse(queryStr);

  //converts string with : separated value to obj
  function parseConditionString(obj) {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const conditionString = obj[key];

        // Split the condition string by ':'
        const [operator, value] = conditionString.split(":");

        // Create the nested structure
        result[key] = { [operator]: parseFloat(value) };
      }
    }
    return result;
  }
  return parseConditionString(parsed);
};

const ApiFeatures = async (mongoQuery, req) => {
  //pagination
  let page = (req.query.page >= 1 ? req.query.page : 1) - 1;
  const resultsPerPage = req.query.limit || 10;

  //sorting
  const sortTerm = req.query.sort || "";
  const order = req.query.order; //1 for asc and -1 for desc
  //sort the book list based on sort term and sort them asc or desc order
  const sortCriteria = {};
  if (sortTerm !== "") {
    sortCriteria[sortTerm] = order === "asc" ? 1 : -1;
  }

  //filtering
  //for filtering = is for equals to < is for less than <=less than equals to and so on
  //for eg ?average_ratings==10 ?average_ratings= >=10
  const filterQuery = getFilterQuery(req.query);

  const results = await mongoQuery
    .find(filterQuery)
    .sort(sortCriteria)
    .limit(resultsPerPage)
    .skip(resultsPerPage * page);

  return {
    ...(results.length === 0
      ? { message: "there is no data to show", data: [] }
      : {
          count: results.length,
          page: page + 1,
          data: results,
        }),
  };
};

export default ApiFeatures;
