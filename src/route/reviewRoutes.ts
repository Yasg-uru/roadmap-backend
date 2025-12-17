import express from 'express'; 
import {getAllReviews, getReview, createReview, updateReview, deleteReview, getReviewsByRoadmap} from '../controller/reviewController'; 


const router = express.Router(); 

router.route('/').get(getAllReviews).post(createReview); 

router.route('/roadmap/:roadmapId').get(getReviewsByRoadmap); 

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);  


export default router; 