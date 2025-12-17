import express from 'express'; 
import {
      getAllAnalytics, getAnalyticsByDate, upsertAnalytics, deleteAnalytics 
}  from '../controller/analyticsController'; 

const router = express.Router(); 


router.get('/', getAllAnalytics); 

router.get('/:date', getAnalyticsByDate); 

router.post('/', upsertAnalytics); 

router.delete('/:date', deleteAnalytics); 

export default router; 