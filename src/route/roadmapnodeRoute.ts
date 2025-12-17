import express from 'express'; 

import {getAllNodes, getNode, createNode, updateNode, deleteNode, getNodesByRoadmap}  from '../controller/roadmapnodeController'; 


const router = express.Router(); 


router.route('/').get(getAllNodes).post(createNode); 

router.route('/roadmap/:roadmapId').get(getNodesByRoadmap); 

router.route('/:id').get(getNode).patch(updateNode).delete(deleteNode); 

export default router; 

