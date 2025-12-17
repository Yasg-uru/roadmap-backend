import { Response } from "express";
import ResourceBookmark from "../models/resource-bookmark.model";
import { reqwithuser } from "../middleware/auth.middleware";

// Get all resource bookmarks for the authenticated user
export const getResourceBookmarksByUser = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const bookmarks = await ResourceBookmark.find({ user: userId })
      .populate({
        path: "resource",
        select: "title url description resourceType thumbnail stats author",
      })
      .select("tags notes isFavorite createdAt updatedAt");
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching resource bookmarks", error: err });
  }
};

// Create a new resource bookmark
export const createResourceBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const { resource, tags, notes, isFavorite } = req.body;
    const existing = await ResourceBookmark.findOne({ user: userId, resource });
    if (existing) {
      return res.status(400).json({ message: "Bookmark already exists for this resource." });
    }
    const bookmark = await ResourceBookmark.create({ user: userId, resource, tags, notes, isFavorite });
    res.status(201).json({ message: "Resource bookmark created successfully!", data: bookmark });
  } catch (err) {
    res.status(500).json({ message: "Error creating resource bookmark", error: err });
  }
};

// Delete a resource bookmark
export const deleteResourceBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const { resourceId } = req.params;
    await ResourceBookmark.findOneAndDelete({ user: userId, resource: resourceId });
    res.status(200).json({ message: "Resource bookmark deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting resource bookmark", error: err });
  }
};

// Check if a resource is bookmarked
export const checkResourceBookmarked = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const { resourceId } = req.params;
    const bookmarkExists = await ResourceBookmark.exists({ user: userId, resource: resourceId });
    res.status(200).json({ isBookmarked: !!bookmarkExists });
  } catch (err) {
    res.status(500).json({ message: "Error checking resource bookmark", error: err });
  }
};
