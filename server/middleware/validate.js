const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Place after express-validator chains; turns failures into a 400
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array().map((e) => e.msg).join(', '));
  }
  next();
};
