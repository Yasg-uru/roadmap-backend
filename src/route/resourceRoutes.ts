import express from 'express'; 
import {getAllResources, getResourceById, createResource, updateResource, deleteResource, upvoteResource, downvoteResource} from '../controller/resourceController'; 
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router(); 


router.get('/', getAllResources); 
router.get('/:id', getResourceById); 
router.post('/', isAuthenticated, createResource); 
router.patch('/:id', isAuthenticated, updateResource); 
router.delete('/:id', isAuthenticated, deleteResource);
router.patch('/:resourceId/upvote', isAuthenticated, upvoteResource); 
router.patch('/:resourceId/downvote', isAuthenticated, downvoteResource); 


export default router; 