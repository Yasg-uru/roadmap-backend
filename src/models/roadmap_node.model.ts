import mongoose, { Document, Schema, model } from 'mongoose';

export interface IRoadmapNode extends Document {
  _id:mongoose.Types.ObjectId;
  roadmap: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  depth: number;
  position: number;
  nodeType?: 'topic' | 'skill' | 'milestone' | 'project' | 'checkpoint';
  isOptional?: boolean;
  estimatedDuration?: {
    value: number;
    unit: 'hours' | 'days' | 'weeks';
  };
  resources?: mongoose.Types.ObjectId[];
  dependencies?: mongoose.Types.ObjectId[];
  prerequisites?: mongoose.Types.ObjectId[];
  metadata?: {
    keywords?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    importance?: 'low' | 'medium' | 'high' | 'critical';
  };
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const nodeSchema = new Schema<IRoadmapNode>(
  {
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    depth: {
      type: Number,
      required: true,
      min: 0,
    },
    position: {
      type: Number,
      required: true,
    },
    nodeType: {
      type: String,
      enum: ['topic', 'skill', 'milestone', 'project', 'checkpoint'],
      default: 'topic',
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    estimatedDuration: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'weeks'],
        default: 'hours',
      },
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
      },
    ],
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoadmapNode',
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoadmapNode',
      },
    ],
    metadata: {
      keywords: [String],
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
      },
      importance: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
nodeSchema.index({ roadmap: 1 });
nodeSchema.index({ depth: 1 });
nodeSchema.index({ position: 1 });
nodeSchema.index({ nodeType: 1 });
nodeSchema.index({ 'metadata.difficulty': 1 });
nodeSchema.index({ 'metadata.importance': 1 });

// Virtual: for hierarchical/child structure
nodeSchema.virtual('children', {
  ref: 'RoadmapNode',
  localField: '_id',
  foreignField: 'dependencies',
  justOne: false,
});

// Middleware
nodeSchema.pre('save', function (next) {
  if (
    this.isModified('resources') ||
    this.isModified('dependencies') ||
    this.isModified('prerequisites')
  ) {
    this.updatedAt = new Date();
  }
  next();
});

const RoadmapNode = model<IRoadmapNode>('RoadmapNode', nodeSchema);
export default RoadmapNode;
