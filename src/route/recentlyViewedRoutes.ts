import express from 'express';
import { addRecentlyViewed, getRecentlyViewedForUser } from '../controller/recentlyViewed.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', isAuthenticated, addRecentlyViewed);
router.get('/', isAuthenticated, getRecentlyViewedForUser);

export default router;
