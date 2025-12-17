import express from 'express';
import {getAllResourceReviews, getResourceReview, createResourceReview, updateResourceReview, deleteResourceReview, getReviewsByResource, getUserResourceReviews} from '../controller/resourceReviewController';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllResourceReviews);
router.get('/resource/:resourceId', getReviewsByResource);

// Protected routes
router.use(isAuthenticated); // All routes below require authentication

router.post('/', createResourceReview);
router.get('/user', getUserResourceReviews);
router.route('/:id')
  .get(getResourceReview)
  .patch(updateResourceReview)
  .delete(deleteResourceReview);

export default router;