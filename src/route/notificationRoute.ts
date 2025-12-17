import express from 'express'; 
import { getUserNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification}  from '../controller/notificationController';
import { create } from 'ts-node';


const router = express.Router(); 

router.get('/:userId', getUserNotifications); 
router.post('/', createNotification); 
router.patch('/read/:notificationId', markAsRead); 
router.patch('/read-all/:userId', markAllAsRead);
router.delete('/:notificationId', deleteNotification); 


export default router; 

