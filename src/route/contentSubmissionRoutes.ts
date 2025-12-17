import express from 'express'; 
import {getAllSubmissions, getSubmission, createSubmission, updateSubmission, deleteSubmission}   from '../controller/contentSubmissionController';


const router = express.Router(); 

router.route('/').get(getAllSubmissions).post(createSubmission); 

router.route('/:id').get(getSubmission).patch(updateSubmission).delete(deleteSubmission); 


export default router; 