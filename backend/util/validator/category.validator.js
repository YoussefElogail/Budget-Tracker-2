import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import User from "../../models/user.model.js";

const createCategoryValidator = [
  check("title")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be between 2 and 100 characters"),
  check("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  check("user")
    .isMongoId()
    .withMessage("User must be a valid Mongo ID")
    .custom(async (val) => {
      const user = await User.findById(val);
      if (!user) {
        throw new Error("User not found");
      }
    }),
  validatorMiddleware,
];

export default createCategoryValidator;
