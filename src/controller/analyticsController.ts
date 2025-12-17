import { Request, Response } from "express"; 
import Analytics from "../models/analytics.model";
import { updateNodeProgress } from "./userProgress.controller";

export const getAllAnalytics = async(req: Request, res: Response) => {
      try{
          const analytics = await Analytics.find().sort({
              date: -1
          }); 
          res.status(200).json(analytics); 
      }  catch(err){
            res.status(500).json({
                 errror: 'Failed to fetch analytics' 
            }); 
      }
}; 


export const getAnalyticsByDate = async (req: Request, res: Response) => {
      const {date} = req.params; 

      try{
          const analytics = await Analytics.findOne({
             date: new Date(date) 
          }); 

          if(!analytics){
              return res.status(404).json({
                 error: 'Analytics not found for this date'
              }); 
          }
          res.status(200).json(analytics); 
      }  catch(err){
         res.status(500).json({
             error: 'Failed to fetch analytics  '
         }); 

      }; 
    }
    
    

export const upsertAnalytics = async(req: Request, res: Response) =>{
      const {date} = req.body; 

      if(!date){
          return res.status(400).json({
             error: 'Date is required '
          }); 
      }


      try{
          const updateAnalytics = await Analytics.findOneAndUpdate(
            {date: new Date(date)}, 
            req.body, 
            {upsert: true, new : true, runValidators: true} 
          ); 

          res.status(200).json(updateAnalytics); 
      } catch(err){
        console.log(err);
         res.status(500).json({
             
             error: 'failed to upsert analytics ', 
             details: err 
         }); 
      }
}; 



export const deleteAnalytics = async(req: Request,res: Response) => {
      const {date}  = req.params; 

      try{
          const result = await Analytics.findOneAndDelete({
              date: new Date(date)
          });  

          if(!result){
             return res.status(404).json({
                error: 'Analytics not found'
             }); 
          }
          res.status(200).json({
             message: 'analytics deleted ' 
          }); 
      } catch(err){
         res.status(500).json({
             error: 'Failed to delete analytics '
         }); 
      }
}; 


