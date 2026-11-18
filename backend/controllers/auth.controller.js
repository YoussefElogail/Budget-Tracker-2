import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { generateToken } from "../middlewares/jwtGenerator.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
  });
  res.status(201).json({
    message: "User registered successfully",
    data: newUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.status(404).json({
      message: "Invalid email or password",
    });
  } else {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid email or password",
      });
    } else {
      const token = generateToken(user._id);
      user.password = undefined; // Remove password from the response
      res.status(200).json({
        message: "User logged in successfully",
        token,
        data: user,
      });
    }
  }
});

export const protectedRoute = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
});

export const isAllowedRoles = (roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to perform this action" });
    }
    next();
  });
};
