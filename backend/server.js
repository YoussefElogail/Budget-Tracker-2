import path from "path";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import categoryRouter from "./routes/category.route.js";
import transactionRouter from "./routes/transaction.route.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(import.meta.dirname, "uploads")));

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`Running on port ${process.env.PORT}`),
    );
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
};
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/transactions", transactionRouter);

app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});
app.use((err, req, res, next) => {
  console.error(`______________\nError: ${err.stack}\n______________\n`);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

startServer();
