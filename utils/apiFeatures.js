module.exports = class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Stringify the query object
    let queryStr = JSON.stringify(queryObj);

    // Replace operators (gte, gt, lte, lt, in, eq) with MongoDB query format ($gte, $in, etc.)
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|eq)\b/g,
      (match) => `$${match}`,
    );

    // Parse the query string back into an object
    queryStr = JSON.parse(queryStr);

    // Handle arrays in the query (e.g., $in: '1,2,3' -> $in: [1, 2, 3])
    Object.keys(queryStr).forEach((key) => {
      if (typeof queryStr[key] === 'object' && queryStr[key].$in) {
        if (typeof queryStr[key].$in === 'string') {
          queryStr[key].$in = queryStr.loai.$in
            .replace(/[[\]]/g, '')
            .split(',')
            .map(Number);
        }
      }
    });

    // Apply the parsed and modified query to the MongoDB query
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  panigation() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
