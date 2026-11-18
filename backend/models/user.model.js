import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      minLength: [2, "User name mast be at least 2 characters"],
      maxLength: [50, "User name must be less than 50 characters"],
      default: `User-${Math.floor(Math.random() * 10000)}`,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      maxLength: [50, "Email must be less than 50 characters"],
      minLength: [5, "Email must be at least 5 characters"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      maxLength: [50, "Password must be less than 50 characters"],
      trim: true,
      select: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      trim: true,
    },
    age: {
      type: Number,
      min: [0, "Age must be a positive number"],
      max: [120, "Age must be less than or equal to 120"],
    },
    phones: [String],
    address: [
      {
        city: String,
        country: String,
      },
    ],
    jobs: [String],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
const user = mongoose.model("User", userSchema);

export default user;
