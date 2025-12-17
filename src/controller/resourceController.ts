import { Request, Response } from "express";
import Resource from "../models/resource.model";

export const getAllResources = async (req: Request, res: Response) => {
  try {
    const { approved } = req.query;
    const query =
      approved !== undefined ? { isApproved: approved === "true" } : {};

    const resources = await Resource.find(query);
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching resouces",
      error: err,
    });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({
        message: "Resource not found",
      });

    res.status(200).json(resource);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching resource",
      error: err,
    });
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({
      message: "Resource created",
      data: resource,
    });
  } catch (err) {
    res.status(400).json({
      message: "error creating resource",
      error: err,
    });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({
        message: "Resource not found",
      });
    res.status(200).json({
      message: "Resource updated ",
      data: updated,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error updating resource ",
      error: err,
    });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({
        message: "Resource not found",
      });

    res.status(200).json({
      message: "Resource deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting resource",
      error: err,
    });
  }
};

export const upvoteResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource)
      return res.status(404).json({
        message: "Resource not found",
      });
    
    // Remove from downvotes if present
    resource.downvotes =
      resource.downvotes?.filter((id) => id.toString() !== userId.toString()) || [];
    
    // Toggle upvote
    const alreadyUpvoted = resource.upvotes?.some((id) => id.toString() === userId.toString());
    if (alreadyUpvoted) {
      // Remove upvote
      resource.upvotes = resource.upvotes?.filter((id) => id.toString() !== userId.toString()) || [];
    } else {
      // Add upvote
      if (!resource.upvotes) resource.upvotes = [];
      resource.upvotes.push(userId);
    }
    
    if (!resource.stats) {
      resource.stats = {};
    }
    resource.stats.rating = resource.calculateRating();
    resource.stats.ratingsCount = (resource.upvotes?.length ?? 0) + (resource.downvotes?.length ?? 0);
    await resource.save();

    res.status(200).json({
      message: alreadyUpvoted ? "Upvote removed" : "Upvoted",
      data: resource,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error upvoting resource",
      error: err,
    });
  }
};

export const downvoteResource = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const userId = (req as any).user?._id;
    
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User not authenticated",
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource)
      return res.status(404).json({
        message: "Resource not found",
      });

    // Remove from upvotes if present
    resource.upvotes =
      resource.upvotes?.filter((id) => id.toString() !== userId.toString()) || [];

    // Toggle downvote
    const alreadyDownvoted = resource.downvotes?.some((id) => id.toString() === userId.toString());
    if (alreadyDownvoted) {
      // Remove downvote
      resource.downvotes = resource.downvotes?.filter((id) => id.toString() !== userId.toString()) || [];
    } else {
      // Add downvote
      if (!resource.downvotes) resource.downvotes = [];
      resource.downvotes.push(userId);
    }

    if (!resource.stats) {
      resource.stats = {};
    }
    resource.stats.rating = resource.calculateRating();
    resource.stats.ratingsCount = (resource.upvotes?.length ?? 0) + (resource.downvotes?.length ?? 0);
    await resource.save();

    res.status(200).json({
      message: alreadyDownvoted ? "Downvote removed" : "Downvoted",
      data: resource,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error downvoting resource",
      error: err,
    });
  }
};
