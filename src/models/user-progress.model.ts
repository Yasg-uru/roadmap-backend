import mongoose, { Document, Query, Schema, model } from "mongoose";

export type ProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export interface IResourceProgress {
  resource: mongoose.Types.ObjectId;
  status: ProgressStatus;
  completedAt?: Date;
}

export interface INodeProgress {
  node: mongoose.Types.ObjectId;
  status: ProgressStatus;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  resources?: IResourceProgress[];
}

export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId;
  roadmap: mongoose.Types.ObjectId;
  nodes: INodeProgress[];
  currentNodes: mongoose.Types.ObjectId[];
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
  lastUpdated?: Date;
  stats: {
    totalNodes: number;
    completedNodes: number;
    completionPercentage: number;
    totalResources: number;
    completedResources: number;
  };
}

const resourceProgressSchema = new Schema<IResourceProgress>(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped"],
      default: "not_started",
    },
    completedAt: Date,
  },
  { _id: false }
);

const nodeProgressSchema = new Schema<INodeProgress>(
  {
    node: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoadmapNode",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped"],
      default: "not_started",
    },
    startedAt: Date,
    completedAt: Date,
    notes: String,
    resources: [resourceProgressSchema],
  },
  { _id: false }
);

const userProgressSchema = new Schema<IUserProgress>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Roadmap",
      required: true,
    },
    nodes: [nodeProgressSchema],
    currentNodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoadmapNode",
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: Date,
    stats: {
      totalNodes: Number,
      completedNodes: {
        type: Number,
        default: 0,
      },
      completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      totalResources: Number,
      completedResources: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ roadmap: 1 });
userProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });
userProgressSchema.index({ "nodes.node": 1 });
userProgressSchema.index({ "nodes.status": 1 });
userProgressSchema.index({ isCompleted: 1 });

// Document middleware
userProgressSchema.pre("save", function (next) {
  if (this.isModified("nodes") || this.isNew) {
    const completedNodes = this.nodes.filter(
      (n) => n.status === "completed"
    ).length;
    const totalNodes = this.nodes.length;

    this.stats.completedNodes = completedNodes;
    this.stats.totalNodes = totalNodes;
    this.stats.completionPercentage =
      totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    let totalResources = 0;
    let completedResources = 0;

    this.nodes.forEach((node) => {
      if (node.resources?.length) {
        totalResources += node.resources.length;
        completedResources += node.resources.filter(
          (r) => r.status === "completed"
        ).length;
      }
    });

    this.stats.totalResources = totalResources;
    this.stats.completedResources = completedResources;

    this.isCompleted = totalNodes > 0 && completedNodes === totalNodes;
    this.completedAt = this.isCompleted ? new Date() : undefined;
  }

  this.lastUpdated = new Date();
  next();
});

userProgressSchema.pre(
  /^find/,
  function (this: Query<any, IUserProgress>, next) {
    this.populate([
      {
        path: "roadmap",
        select: "title slug category",
      },
      {
        path: "nodes.node",
        select: "title description nodeType",
      },
      {
        path: "currentNodes",
        select: "title description nodeType",
      },
    ]);
    next();
  }
);
const userProgressModel = model<IUserProgress>("UserProgress", userProgressSchema);
export default userProgressModel