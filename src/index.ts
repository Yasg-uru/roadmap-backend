import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import ConnectDatabase from "./lib/connectDb";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./route/user.route";
import RoadmapRouter from "./route/roadmap.route";
import { ErrorhandlerMiddleware } from "./util/Errorhandler.util";
import userProgressRoutes from './route/userProgress.routes';
import analyticsRoutes from './route/analyticsRoutes';
import bookmarkRoutes  from "./route/bookmarkRoutes";
import resourceBookmarkRoutes from "./route/resourceBookmarkRoutes";
import recentlyViewedRoutes from './route/recentlyViewedRoutes';
import notificationRoutes from "./route/notificationRoute";
import resourceRoutes from './route/resourceRoutes';
import reviewRoutes from './route/reviewRoutes';
import resourceReviewRoutes from './route/resourceReviewRoutes';
import roadmapnodeRoutes from "./route/roadmapnodeRoute";
import contentSubmissionRoutes from "./route/contentSubmissionRoutes";





dotenv.config();
ConnectDatabase();

export const userSocketMap = new Map<string, string>();

const app = express();
const server = http.createServer(app); 


export const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

   socket.on("registerUser", (userId: string) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });


  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});


app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true})); 


app.use("/user", userRouter);
app.use("/roadmap", RoadmapRouter);
app.use("/api/progress", userProgressRoutes); 
app.use("/api/analytics", analyticsRoutes); 
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/resource-bookmarks", resourceBookmarkRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/resource-reviews", resourceReviewRoutes);
app.use("/api/roadmapnode", roadmapnodeRoutes); 
app.use("/api/submissions", contentSubmissionRoutes);     

app.use(ErrorhandlerMiddleware);


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
