module.exports = class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'limit', 'sort', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|eq)\b/g,
      (match) => `$${match}`,
    );
    queryStr = JSON.parse(queryStr);

    Object.keys(queryStr).forEach((key) => {
      if (typeof queryStr[key] === 'object' && queryStr[key].$in) {
        if (typeof queryStr[key].$in === 'string') {
          queryStr[key].$in = queryStr[key].$in
            .replace(/[[\]]/g, '')
            .split(',')
            .map((val) => (Number.isNaN(val) ? val : Number(val)));
        }
      }
    });
    this.query = this.query.find(queryStr);
    return this;
  }

  sort(defaultSort = '-createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort(defaultSort);
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

  async panigation() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.totalDocs = await this.query.clone().countDocuments();
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
};
