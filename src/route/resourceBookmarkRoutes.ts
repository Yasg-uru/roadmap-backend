import express from 'express';
import { getResourceBookmarksByUser, createResourceBookmark, deleteResourceBookmark, checkResourceBookmarked } from '../controller/resourceBookmarkController';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', isAuthenticated, getResourceBookmarksByUser);
router.post('/create', isAuthenticated, createResourceBookmark);
router.delete('/:resourceId', isAuthenticated, deleteResourceBookmark);
router.get('/check/:resourceId', isAuthenticated, checkResourceBookmarked);

export default router;
