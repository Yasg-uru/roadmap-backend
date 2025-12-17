import express, {Router} from 'express'; 


import {
    getRoadmapsPaginated, 
    createRoadmap, 
    getRoadmapDetails, 
    updateRoadmapWithNodes, 
    getRoadmapReviews,
    deleteRoadmap, 
    updateRoadmap, 
    togglePublishRoadmap,
    generateRoadmapWithAi,
    upvoteRoadmap,
    downvoteRoadmap,
    regenerateRoadmap, 
     } 
     from "../controller/roadmap.controller";

import { authorization, isAuthenticated }
 from "../middleware/auth.middleware";

const RoadmapRouter = Router();

RoadmapRouter.get('/', getRoadmapsPaginated); 
RoadmapRouter.post("/generate", isAuthenticated , generateRoadmapWithAi);
RoadmapRouter.get('/:idOrSlug', getRoadmapDetails); 
RoadmapRouter.get('/:roadmapId/reviews', getRoadmapReviews); 
RoadmapRouter.post('/', isAuthenticated, createRoadmap); 
RoadmapRouter.patch('/:roadmapId', isAuthenticated, updateRoadmap);
RoadmapRouter.patch('/:roadmapId/nodes', isAuthenticated, updateRoadmapWithNodes);
RoadmapRouter.patch('/:id/publish', isAuthenticated, togglePublishRoadmap); 
RoadmapRouter.patch('/:id/upvote', isAuthenticated, upvoteRoadmap);
RoadmapRouter.patch('/:id/downvote', isAuthenticated, downvoteRoadmap);
RoadmapRouter.post('/:id/regenerate', isAuthenticated, regenerateRoadmap);
RoadmapRouter.delete('/:roadmapId', isAuthenticated, deleteRoadmap); 




export default RoadmapRouter;