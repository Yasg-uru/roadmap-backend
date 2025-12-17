import { Request, Response } from 'express';
import RecentlyViewed from '../models/recentlyViewed.model';
import { reqwithuser } from '../middleware/auth.middleware';

// Add or update a recently viewed entry (upsert)
export const addRecentlyViewed = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const { roadmapId } = req.body;
    if (!roadmapId) return res.status(400).json({ message: 'roadmapId required' });

    const doc = await RecentlyViewed.findOneAndUpdate(
      { user: userId, roadmap: roadmapId },
      { viewedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(doc);
  } catch (err) {
    console.error('addRecentlyViewed error', err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get recently viewed roadmaps for authenticated user (most recent first)
export const getRecentlyViewedForUser = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;
    const items = await RecentlyViewed.find({ user: userId })
      .sort({ viewedAt: -1 })
      .limit(10)
      .populate({ path: 'roadmap', select: 'title slug description category difficulty stats contributor coverImage' });

    return res.status(200).json(items);
  } catch (err) {
    console.error('getRecentlyViewedForUser error', err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};
