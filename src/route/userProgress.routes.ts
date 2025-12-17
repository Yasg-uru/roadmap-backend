import express from 'express'; 

import { getUserProgress, upsertUserProgress, updateNodeProgress, deleteUserProgress, startRoadmap, getUserCourses } from '../controller/userProgress.controller';
import { isAuthenticated } from '../middleware/auth.middleware';



const router = express.Router(); 


router.get("/user/roadmap/:roadmapId",isAuthenticated,  getUserProgress); 
router.put("/user/:userId/roadmap/:roadmapId", upsertUserProgress); 
router.patch("/user/roadmap/:roadmapId/:nodeId",isAuthenticated, updateNodeProgress);
router.post("/user/start/:roadmapId", isAuthenticated, startRoadmap);
router.get("/user/courses", isAuthenticated , getUserCourses)
router.delete("/user/:userId/roadmap/:roadmapId", deleteUserProgress); 


export default router; 