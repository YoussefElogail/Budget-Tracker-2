import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteUsers,
  changeIsActiveStatus,
} from "../controllers/user.controller.js";
import {
  isAllowedRoles,
  protectedRoute,
} from "../controllers/auth.controller.js";
import categoryRouter from "./category.route.js";
import { createUserValidator } from "../util/validator/user.validator.js";

const userRouter = Router();
userRouter.use("/:userId/categories", categoryRouter);

userRouter
  .get("/", protectedRoute, isAllowedRoles(["admin"]), getAllUsers)
  .post(
    "/",
    protectedRoute,
    isAllowedRoles(["admin"]),
    createUserValidator,
    createUser,
  );
userRouter.delete(
  "/delete-all",
  protectedRoute,
  isAllowedRoles(["admin"]),
  deleteUsers,
);
userRouter.put(
  "/:id/change-status",
  protectedRoute,
  isAllowedRoles(["admin"]),
  changeIsActiveStatus,
);
userRouter
  .get("/:id", protectedRoute, isAllowedRoles(["admin"]), getUser)
  .put("/:id", protectedRoute, isAllowedRoles(["admin"]), updateUser)
  .delete("/:id", protectedRoute, isAllowedRoles(["admin"]), deleteUser);

export default userRouter;
