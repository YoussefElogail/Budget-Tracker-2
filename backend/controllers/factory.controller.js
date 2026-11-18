import asyncHandler from "express-async-handler";

export const createOne = (model, modelName) =>
  asyncHandler(async (req, res) => {
    const newItem = await model.create(req.body);
    res.status(201).json({
      message: `${modelName} created successfully`,
      data: newItem,
    });
  });

export const getAll = (model, modelName) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.user.role === "user") filter = { user: String(req.user.id) };
    if (req.params.userId) filter = { user: req.params.userId };
    const count = await model.countDocuments(filter);
    let query = model.find(filter);
    if (modelName === "transactions") {
      query = query.populate("category", "title type");
    }
    const allItems = await query;
    res.status(200).json({
      message: `${modelName} fetched successfully`,
      data: allItems,
      count,
    });
  });

export const getOne = (model, modelName) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    let query = model.findById(id);
    if (modelName === "transaction") {
      query = query.populate("category", "title type");
    }
    const item = await query;
    if (!item) {
      res.status(404).json({
        message: `${modelName} not found`,
      });
    } else {
      res.status(200).json({
        message: `${modelName} fetched successfully`,
        data: item,
      });
    }
  });

export const updateOne = (model, modelName) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const newItem = await model.findById(id);
    newItem.set(req.body);
    await newItem.save();
    if (!newItem) {
      res.status(404).json({
        message: `${modelName} not found`,
      });
    } else {
      res.status(200).json({
        message: `${modelName} updated successfully`,
        data: newItem,
      });
    }
  });

export const deleteOne = (model, modelName) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedItem = await model.findByIdAndDelete(id);
    if (!deletedItem) {
      res.status(404).json({
        message: `${modelName} not found`,
      });
    } else {
      res.status(200).json({
        message: `${modelName} deleted successfully`,
        data: deletedItem,
      });
    }
  });
