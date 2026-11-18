import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  isAllowedRoles,
  protectedRoute,
} from "../controllers/auth.controller.js";
import createCategoryValidator from "../util/validator/category.validator.js";

const categoryRouter = Router({ mergeParams: true });

categoryRouter
  .route("/")
  .get(protectedRoute, isAllowedRoles(["admin", "user"]), getAllCategories)
  .post(
    protectedRoute,
    isAllowedRoles(["admin", "user"]),
    createCategoryValidator,
    createCategory,
  );
categoryRouter
  .route("/:id")
  .get(protectedRoute, isAllowedRoles(["admin", "user"]), getCategoryById)
  .put(protectedRoute, isAllowedRoles(["admin", "user"]), updateCategory)
  .delete(protectedRoute, isAllowedRoles(["admin", "user"]), deleteCategory);

export default categoryRouter;
