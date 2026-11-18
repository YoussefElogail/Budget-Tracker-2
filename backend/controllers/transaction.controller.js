import sharp from "sharp";
import { v4 as uuid } from "uuid";
import asyncHandler from "express-async-handler";
import Transaction from "../models/transaction.model.js";
import {
  createOne,
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from "./factory.controller.js";
import { uploadImageSingle } from "../middlewares/UploadImageMiddleware.js";

export const transactionImage = uploadImageSingle("image");

export const resizeImage = async (req, res, next) => {
  if (!req.file) return next();
  const filename = `transaction-${uuid()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/${filename}`);
  req.body.image = filename;
  next();
};

export const createTransaction = createOne(Transaction, "transaction");
export const getAllTransactions = getAll(Transaction, "transactions");
export const getTransaction = getOne(Transaction, "transaction");
export const updateTransaction = updateOne(Transaction, "transaction");
export const deleteTransaction = deleteOne(Transaction, "transaction");

export const getBalance = asyncHandler(async (req, res) => {
  const stats = await Transaction.aggregate([
    {
      $match: { user: req.user._id },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  let totalIncomes = 0;
  let totalExpenses = 0;

  stats.forEach((item) => {
    if (item._id === "income") totalIncomes = item.total;
    if (item._id === "expense") totalExpenses = item.total;
  });

  const balance = totalIncomes - totalExpenses;

  res.status(200).json({
    message: "Balance retrieved successfully",
    data: {
      totalIncomes,
      totalExpenses,
      balance,
    },
  });
});
