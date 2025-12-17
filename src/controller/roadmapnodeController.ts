import { Request, Response, NextFunction } from "express"; 
import RoadmapNode from "../models/roadmap_node.model";



export const getAllNodes = async(req: Request, res: Response, next: NextFunction) => {
      try{
          const nodes = await RoadmapNode.find().populate('resources').populate('dependencies').populate('prerequisites'); 
          res.status(200).json({
              status: 'success', 
              results: nodes.length, 
              data: nodes
          }); 
      } catch(err){ 
        next(err); 
      }
}; 


export const getNodesByRoadmap = async(req: Request, res: Response, next: NextFunction) =>{
      try{
         const nodes = await RoadmapNode.find({
             roadmap: req.params.roadmapId
         }) 
         .populate('resources').populate('dependencies').populate('prerequisites'); 
         res.status(200).json({
             status: 'success', 
             results: nodes.length, 
             data: nodes
         }); 
      }catch(err){
         next(err); 
      }
}; 


export const getNode = async(req: Request, res: Response, next: NextFunction) => {
    try{
         const node = await RoadmapNode.findById(req.params.id).populate('resources')
         .populate('dependencies') 
         .populate('prerequisites').populate('children'); 
         if(!node) return res.status(404).json({
             message: 'node not found'
         }); 
         res.status(200).json({
            status: 'success', 
            data: node 
         }); 
    }  catch(err){
         next(err); 
    }
}; 



export const createNode = async(req: Request, res: Response, next: NextFunction)=>{
     try{
         const newNode = await RoadmapNode.create(req.body); 
         res.status(201).json({
             status: 'success', 
             data: newNode 
         }); 
     } catch(err){
         next(err); 
     }
}; 



export const updateNode= async(req: Request, res: Response, next: NextFunction) => {
     try{
          const node = await RoadmapNode.findByIdAndUpdate(req.params.id, req.body, {
             new:true, 
             runValidators: true 
          }); 
          if(!node) return res.status(404).json({
             message: 'node not found' 
          }); 
          res.status(200).json({
             status: 'success',
             data: node 
          }); 
     } catch(err){
         next(err); 
     }
};



export const deleteNode = async(req: Request, res: Response, next: NextFunction) => {
     try{
          const node = await RoadmapNode.findByIdAndDelete(req.params.id); 
          if(!node)  return res.status(404).json({
              message: 'Node not found' 
          }); 

          res.status(204).json({
             status: 'success', 
             data: node 
          }); 
     } catch(err){
         next(err); 
     }
}; 


