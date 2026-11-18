import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "./factory.controller.js";

export const createUser = createOne(User, "user");
export const getAllUsers = getAll(User, "users");
export const getUser = getOne(User, "user");
export const updateUser = updateOne(User, "user");
export const deleteUser = deleteOne(User, "user");

export const deleteUsers = asyncHandler(async (req, res) => {
  const result = await User.deleteMany({
    role: "user",
  });
  res.status(200).json({
    message: "All users deleted successfully",
    data: result,
  });
});

export const changeIsActiveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isActive = !user.isActive;
  await user.save();
  res.status(200).json({ message: "User status updated successfully" });
});
