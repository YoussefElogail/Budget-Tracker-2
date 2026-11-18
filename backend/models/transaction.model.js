import mongoose from "mongoose";

const transactionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Transaction title is required"],
      minLength: [2, "Transaction title must be at least 2 characters"],
      maxLength: [50, "Transaction title must be less than 50 characters"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0, "Transaction amount must be a positive number"],
      max: [
        1000000,
        "Transaction amount must be less than or equal to 1000000",
      ],
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: [true, "Transaction type is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Transaction must belong to a category"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Transaction must belong to a user"],
      trim: true,
    },
    description: {
      type: String,
      maxLength: [
        500,
        "Transaction description must be less than 500 characters",
      ],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);


const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
