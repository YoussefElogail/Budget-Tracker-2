import { Router } from "express";
import {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  resizeImage,
  transactionImage,
  getBalance,
} from "../controllers/transaction.controller.js";
import {
  isAllowedRoles,
  protectedRoute,
} from "../controllers/auth.controller.js";
import createTransactionValidator from "../util/validator/transaction.validator.js";

const transactionRouter = Router();
transactionRouter.use(protectedRoute, isAllowedRoles(["admin", "user"]));
transactionRouter
  .route("/")
  .get(getAllTransactions)
  .post(
    transactionImage,
    resizeImage,
    createTransactionValidator,
    createTransaction,
  );
transactionRouter.get("/balance", getBalance);
transactionRouter
  .route("/:id")
  .get(getTransaction)
  .put(
    transactionImage,
    resizeImage,
    createTransactionValidator,
    updateTransaction,
  )
  .delete(deleteTransaction);

export default transactionRouter;
