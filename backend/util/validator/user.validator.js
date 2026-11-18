import { check } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware.js";
import user from "../../models/user.model.js";

export const createUserValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .custom((value) => {
      return user.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("Email is already in use");
        }
      });
    }),
  ,
  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("gender")
    .optional()
    .isIn(["male", "female"])
    .withMessage("Gender must be either 'male' or 'female'"),
  check("age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be a positive number and less than or equal to 120"),
  check("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
  check("phones").optional().isArray().withMessage("Phones must be an array"),

  validatorMiddleware,
];
