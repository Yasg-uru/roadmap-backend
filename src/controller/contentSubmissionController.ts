import { Request, Response, NextFunction } from "express"; 
import ContentSubmission from "../models/submission.model";


export const getAllSubmissions = async(req: Request, res: Response, next: NextFunction) =>{
      try{
         const filter: any = {}; 

         if(req.query.status) filter.status = req.query.status; 
         if(req.query.type) filter.type = req.query.type; 
         if(req.query.user) filter.user = req.query.user; 


         const submissions = await ContentSubmission.find(filter); 
         res.status(200).json({
             status: 'success',
             results: submissions.length, 
             data: submissions, 
         }); 
      }  catch(err){
         next(err); 
      }
}; 


export const getSubmission = async(req: Request, res: Response, next: NextFunction) => {
     try{
        const submission = await ContentSubmission.findById(req.params.id); 
        if(!submission){
             return res.status(404).json({
                  status: 'fail', 
                  message: 'Submission not found'
             }); 
        }  

        res.status(200).json({
              status: 'success',
              data: submission 
        }); 
     }  catch(err){
         next(err); 
     }
};




export const createSubmission = async(req: Request, res: Response, next: NextFunction) => {
     try{
         const newSubmission = await ContentSubmission.create(req.body); 
         res.status(201).json({
             status: 'success', 
             data: newSubmission 
         }); 
     } catch(err){
         next(err); 
     }
}; 



export const updateSubmission = async(req: Request, res: Response, next: NextFunction) => {
      try{
         const updated = await ContentSubmission.findByIdAndUpdate(req.params.id, req.body, {
              new: true, 
              runValidators: true, 
         }); 

         if(!updated){
             return res.status(404).json({
                 status:'fail', 
                 message: 'submission not found'
             }); 
         } 

         res.status(200).json({
             status: 'success', 
             data: updated 
         }); 
      } catch(err){
          next(err); 
      }
}; 



export const deleteSubmission = async(req: Request, res: Response, next: NextFunction) => {
      try{
          const deleted  = await ContentSubmission.findByIdAndDelete(req.params.id); 
          if(!deleted){
             return res.status(404).json({
                 status: 'fail',
                 message: 'submission not found'
             }); 
          }
          res.status(200).json({
             status: 'success', 
             message: 'submission deleted'
          }); 
      }  catch(err){
         next(err); 
      }
}; 

