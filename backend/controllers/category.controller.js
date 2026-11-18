import Category from "../models/category.model.js";
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "./factory.controller.js";

export const createCategory = createOne(Category, "category");
export const getAllCategories = getAll(Category, "categories");
export const getCategoryById = getOne(Category, "category");
export const updateCategory = updateOne(Category, "category");
export const deleteCategory = deleteOne(Category, "category");
