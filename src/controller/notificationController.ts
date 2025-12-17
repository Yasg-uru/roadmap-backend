import { Request, Response  } from "express";
import Notification from "../models/notification.model";


export const getUserNotifications = async(req: Request, res: Response) => {
      try{
          const userId = req.params.userId; 
          const notifications = await Notification.find({
             user: userId 
          }); 
          res.status(200).json(notifications); 
      }  catch(err){
         res.status(500).json({
              message: 'failed to fetch notifications ', 
              error: err 
         }); 
      }
}; 


export const createNotification = async (req: Request, res: Response) => {
      try{
          const newNotification = await Notification.create(req.body); 
          res.status(201).json({
             message: "notification created ", 
             data: newNotification
          }); 
      } catch(err){
         res.status(400).json({
             message: 'failed to create notifications',
             error: err 
         }); 
      }
}; 



export const markAsRead = async (req: Request, res: Response) => {
      try{
         const {notificationId}  = req.params; 
         const updated = await Notification.findByIdAndUpdate(
             notificationId, 
             {isRead: true, readAt: new Date()}, 
             {new: true} 
         ); 

         if(!updated){
             return res.status(404).json({
                 message: "notification not found"
             }); 
         }
         res.status(200).json({
             message: 'marked as read ', 
             data: updated 
         }); 
      } catch(err){
         res.status(500).json({
             message: 'Error updating notification', 
             error: err 
         }); 
      }
}; 



export const deleteNotification = async(req: Request, res: Response) => {
      try{
         const {notificationId} = req.params; 
         const deleted = await Notification.findByIdAndDelete(notificationId); 
         if(!deleted){
             return res.status(404).json({
                 message: 'Notification not found'
             }); 
         }
         res.status(200).json({
             message: 'notification deleted'
         }); 
      } catch(err){
         res.status(500).json({
             message: 'Error deleting notification', 
             error : err 
         }); 
      }
}; 



export const markAllAsRead = async(req: Request, res: Response) => {
      try{
          const {userId} = req.params; 
          await Notification.updateMany(
            {user: userId, isRead: false},
            {isRead: true, readAt: new Date()} 
          ); 
          res.status(200).json({
            message:'All notifications marked as read' 
          }); 
      } catch(err){
         res.status(500).json({
             message: 'Error updating notifications',
             error: err 
         })
      }
}; 


