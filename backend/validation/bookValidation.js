const { body } = require("express-validator");

const addBookValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("isbn").optional({ nullable: true }).trim(),
  body("category").optional({ nullable: true }).trim(),
  body("publication_year")
    .optional({ nullable: true })
    .isInt({
      min: 1000,
      max: 2100,
    })
    .withMessage("Invalid publication year"),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
];

module.exports = {
  addBookValidation,
};