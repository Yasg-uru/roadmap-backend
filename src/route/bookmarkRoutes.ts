import express from 'express'; 
import  {getBookmarksByUser, upsertBookmark, deleteBookmark, getFavoriteBookmarks, getBookmarksByTag, createBookmark, checkBookmark} from '../controller/bookmarkController';  
import Bookmark from '../models/book-mark.model';
import { isAuthenticated } from '../middleware/auth.middleware';



const router = express.Router(); 

router.get('/',isAuthenticated ,  getBookmarksByUser); 
router.post('/', isAuthenticated , upsertBookmark); 
router.post('/create',isAuthenticated ,  createBookmark); 
router.delete('/:roadmapId',isAuthenticated ,  deleteBookmark);
router.get('/:userId/favorites',isAuthenticated ,  getFavoriteBookmarks); 
router.get('/:userId/tag/:tag',isAuthenticated ,  getBookmarksByTag); 
router.get('/check/:roadmapId', isAuthenticated , checkBookmark)

export default router; 

