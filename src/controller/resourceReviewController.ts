import { Request, Response, NextFunction } from "express";
import { reqwithuser } from "../middleware/auth.middleware";
import ResourceReview from "../models/resource-review.model";
import mongoose from "mongoose";

export const getAllResourceReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await ResourceReview.find()
      .populate("user", "name")
      .populate("resource", "title");
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await ResourceReview.findById(req.params.id)
      .populate("user", "name")
      .populate("resource", "title");
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

export const createResourceReview = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resource, rating, title, review, pros, cons } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    // Check if user already reviewed this resource
    const existingReview = await ResourceReview.findOne({
      resource,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this resource"
      });
    }

    const newReview = await ResourceReview.create({
      resource,
      user: userId,
      rating,
      title,
      review,
      pros,
      cons,
      isVerified: false // Could be set based on user verification status
    });

    const populatedReview = await ResourceReview.findById(newReview._id)
      .populate("user", "name")
      .populate("resource", "title");

    res.status(201).json({
      status: "success",
      data: populatedReview,
    });
  } catch (err) {
    next(err);
  }
};

export const updateResourceReview = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, title, review, pros, cons } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const reviewDoc = await ResourceReview.findById(req.params.id);

    if (!reviewDoc) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user owns this review
    if (reviewDoc.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only update your own reviews",
      });
    }

    const updatedReview = await ResourceReview.findByIdAndUpdate(
      req.params.id,
      {
        rating,
        title,
        review,
        pros,
        cons
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name").populate("resource", "title");

    res.status(200).json({
      status: "success",
      data: updatedReview,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteResourceReview = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const review = await ResourceReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can only delete your own reviews",
      });
    }

    await ResourceReview.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

export const getReviewsByResource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resourceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reviews = await ResourceReview.find({ resource: resourceId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ResourceReview.countDocuments({ resource: resourceId });

    res.status(200).json({
      status: "success",
      results: reviews.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserResourceReviews = async (
  req: reqwithuser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    const reviews = await ResourceReview.find({ user: userId })
      .populate("resource", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};