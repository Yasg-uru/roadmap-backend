import { Response, Request } from "express";
import Bookmark from "../models/book-mark.model";
import { reqwithuser } from "../middleware/auth.middleware";

/**
 * Get all bookmarks for the authenticated user
 */
export const getBookmarksByUser = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;

    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: "roadmap",
        select: "title slug description category difficulty coverImage stats isFeatured contributor",
        populate: { path: "contributor", select: "username avatar" }
      })
      .select("tags notes isFavorite createdAt updatedAt");

    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching bookmarks",
      error: err,
    });
  }
};

/**
 * Create a new bookmark for the authenticated user
 */
export const createBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { roadmap, tags, notes, isFavorite } = req.body;

    // Check if a bookmark already exists for this user and roadmap
    const existing = await Bookmark.findOne({ user: userId, roadmap });
    if (existing) {
      return res.status(400).json({
        message: "Bookmark already exists for this roadmap.",
      });
    }

    // Create new bookmark
    const bookmark = await Bookmark.create({
      user: userId,
      roadmap,
      tags,
      notes,
      isFavorite,
    });

    res.status(201).json({
      message: "Bookmark created successfully!",
      data: bookmark,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating bookmark",
      error: err,
    });
  }
};

/**
 * Upsert (create or update) a bookmark for the authenticated user
 */
export const upsertBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { roadmap, tags, notes, isFavorite } = req.body;

    const bookmark = await Bookmark.findOneAndUpdate(
      { user: userId, roadmap },
      { tags, notes, isFavorite, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Bookmark saved successfully",
      data: bookmark,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error saving bookmark",
      error: err,
    });
  }
};

/**
 * Delete a bookmark by roadmap ID for the authenticated user
 */
export const deleteBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { roadmapId } = req.params;

    await Bookmark.findOneAndDelete({
      user: userId,
      roadmap: roadmapId,
    });

    res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting bookmark",
      error: err,
    });
  }
};

/**
 * Get favorite bookmarks for the authenticated user
 */
export const getFavoriteBookmarks = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;

    const favorites = await Bookmark.find({
      user: userId,
      isFavorite: true,
    }).populate("roadmap");

    res.status(200).json(favorites);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching favorite bookmarks",
      error: err,
    });
  }
};

/**
 * Get bookmarks by tag for the authenticated user
 */
export const getBookmarksByTag = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?.id as string;
    const { tag } = req.params;

    const bookmarks = await Bookmark.find({
      user: userId,
      tags: tag,
    }).populate("roadmap");

    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching bookmarks by tag",
      error: err,
    });
  }
};

export const checkBookmark = async (req: reqwithuser, res: Response) => {
  try {
    const roadmapId = req.params.roadmapId;
    const userId = req.user?.id;

    if (!roadmapId) {
      return res.status(400).json({ message: "Roadmap ID is required" });
    }

    // Check if bookmark exists
    const bookmarkExists = await Bookmark.exists({ user: userId, roadmap: roadmapId });

    res.status(200).json({
      roadmapId,
      isBookmarked: !!bookmarkExists,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking bookmark", error: err });
  }
};