import { check } from "express-validator";
import Category from "../../models/category.model.js";
import User from "../../models/user.model.js";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";

const createTransactionValidator = [
  check("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      console.log(value);
      if (value < 0) {
        throw new Error("Amount must be a positive number");
      }
      return true;
    }),
  check("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  check("category")
    .isMongoId()
    .withMessage("Category must be a valid Mongo ID")
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        throw new Error("Category not found");
      }
    }),
  check("user")
    .isMongoId()
    .withMessage("User must be a valid Mongo ID")
    .custom(async (val, { req }) => {
      const user = await User.findById(val);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.id !== req.user.id) {
        throw new Error(
          "You are not authorized to create a transaction for this user",
        );
      }
    }),
  validatorMiddleware,
];

export default createTransactionValidator;
