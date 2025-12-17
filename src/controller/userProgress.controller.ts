import { Request, Response } from "express";
import mongoose from "mongoose";
import UserProgress from "../models/user-progress.model";
import { error } from "console";
import { MongoOIDCError } from "mongodb";
import userProgressModel from "../models/user-progress.model";
import { reqwithuser } from "../middleware/auth.middleware";
import RoadmapNode from "../models/roadmap_node.model";
import { io, userSocketMap } from "..";

// get progress by user and roadmap

export const getUserProgress = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id;

    const { roadmapId } = req.params;

    const progress = await UserProgress.findOne({
      user: userId,
      roadmap: roadmapId,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const startRoadmap = async (req: reqwithuser, res: Response) => {
  try {
    const { roadmapId } = req.params;
    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: user not found in request" });
    }
    const userId = req.user._id;

    // check if progress already exists
    let progress = await UserProgress.findOne({
      user: userId,
      roadmap: roadmapId,
    });

    if (progress) {
      return res.status(200).json({
        message: "Progress already exists",
        progress,
      });
    }

    // get all nodes for this roadmap
    const nodes = await RoadmapNode.find({ roadmap: roadmapId }).lean();

    if (!nodes || nodes.length === 0) {
      return res.status(404).json({
        message: "No nodes found for this roadmap",
      });
    }

    // prepare node progress array
    const nodeProgress = nodes.map((n) => ({
      node: n._id,
      status: "not_started",
      resources: n.resources?.map((r) => ({
        resource: r,
        status: "not_started",
      })),
    }));

    // create new progress doc
    progress = await UserProgress.create({
      user: userId,
      roadmap: roadmapId,
      nodes: nodeProgress,
      currentNodes: [nodes[0]._id], // by default start with first node
    });

    return res.status(201).json({
      message: "Progress created successfully",
      progress,
    });
  } catch (err) {
    console.error("Error starting roadmap:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// // update a specific node progress

export const updateNodeProgress = async (req: reqwithuser, res: Response) => {
  try {
    const { roadmapId, nodeId } = req.params;
    const userId = req.user?._id;
    const { status } = req.body as { status: "not_started" | "in_progress" | "completed" | "skipped" };

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    console.log("Params:", { roadmapId, nodeId, userId, status });

    const progress = await UserProgress.findOne({
      user: new mongoose.Types.ObjectId(userId),
      roadmap: new mongoose.Types.ObjectId(roadmapId),
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // find the node inside user's progress
    const node = progress.nodes.find((n) => n.node.toString() === nodeId);
    if (!node) {
      // if node not exist, add it with status
      progress.nodes.push({
        node: new mongoose.Types.ObjectId(nodeId),
        status,
      });
    } else {
      // update only status
      node.status = status;
    }

    await progress.save();

    // ✅ Emit socket event in real-time
    if (userId) {
      const socketId = userSocketMap.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit("progressUpdated", {
          roadmapId,
          nodeId,
          status,
          progress,
        });
      }
    }

    res.json(progress);
  } catch (error) {
    console.error("failed to update node progress ", error);
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
export const upsertUserProgress = async (req: Request, res: Response) => {
  try {
    const { userId, roadmapId } = req.params;
    const { completedNodes = [] } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      {
        user: new mongoose.Types.ObjectId(userId),
        roadmap: new mongoose.Types.ObjectId(roadmapId),
      },
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (progress.nodes.length === 0 && completedNodes.length > 0) {
      const validNodes = completedNodes.filter((id: any) =>
        mongoose.Types.ObjectId.isValid(id)
      );

      const nodeProgress = validNodes.map((nodeId: any) => ({
        node: new mongoose.Types.ObjectId(nodeId),
        status: "completed",
        startedAt: new Date(),
        completedAt: new Date(),
        resources: [],
      }));

      progress.nodes.push(...nodeProgress);
      progress.markModified("nodes");
    }

    await progress.save();

    return res.json(progress);
  } catch (error) {
    console.error("Error in upsertUser progress", error);
    return res.status(500).json({
      message: "server error",
      error,
    });
  }
};

// delete progress

export const deleteUserProgress = async (req: Request, res: Response) => {
  try {
    const { userId, roadmapId } = req.params;

    const result = await UserProgress.findOneAndDelete({
      user: userId,
      roadmap: roadmapId,
    });

    if (!result) {
      return res.status(404).json({
        message: "progress not found",
      });
    }

    res.json({
      message: "progress deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};


export const getUserCourses = async (req: reqwithuser, res: Response) => {
  try {
    const userId = req.user?._id; // assuming you attach user from auth middleware

    // Fetch all user progress docs and populate roadmap
    const progresses = await UserProgress.find({ user: userId }).populate({
      path: 'roadmap',
      select: 'title'
    });

    // Transform into CourseProgress[]
    const courses = progresses.map((p) => ({
      id: p.roadmap._id.toString(),
      title: (p.roadmap as any).title,
      percentage: p.stats.completionPercentage,
      current: p.stats.completedNodes,
      total: p.stats.totalNodes,
    }));

    return res.json({ courses });
  } catch (error) {
    console.error("Error fetching dashboard courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};