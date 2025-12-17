import { Request, Response, NextFunction } from "express";
import Review from "../models/review.model";
import mongoose from "mongoose";

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("roadmap", "title");
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("user", "name")
      .populate("roadmap", "title");
    if (!review)
      return res.status(404).json({
        message: "Review not found",
      });
    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newReview = await Review.create(req.body);
    res.status(201).json({
      status: "success",
      data: newReview,
    });
  } catch (err) {
    next(err);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review)
      return res.status(404).json({
        message: "Review not found",
      });
    res.status(200).json({
      status: "success",
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review)
      return res.status(404).json({
        message: "Review not found",
      });
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getReviewsByRoadmap = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find({
      roadmap: req.params.roadmapId,
    }).populate("user", "name");
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};
