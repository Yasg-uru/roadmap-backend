import mongoose, { Schema, Document, model } from "mongoose";
import slugify from "slugify";

export interface IRoadmap extends Document {
  title: string;
  slug?: string;
  description: string;
  longDescription?: string;
  category: RoadmapCategory;
  difficulty?: RoadmapDifficulty;
  estimatedDuration?: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };

  coverImage?: {
    public_id: string;
    url: string;
  };

  isFeatured?: boolean;
  isCommunityContributed?: boolean;
  contributor?: mongoose.Types.ObjectId;
  tags?: string[];
  prerequisites?: mongoose.Types.ObjectId[];
  stats?: {
    views: number;
    completions: number;
    averageRating: number;
    ratingsCount: number;
  };
  version?: number;
  isPublished?: boolean;
  publishedAt?: Date;
  lastUpdated?: Date;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Quality and regeneration tracking
  upvotes?: mongoose.Types.ObjectId[];
  downvotes?: mongoose.Types.ObjectId[];
  qualityScore?: number;
  needsRegeneration?: boolean;
  regenerationHistory?: Array<{
    regeneratedAt: Date;
    reason: string;
    previousDownvotes: number;
  }>;
  isPreGenerated?: boolean;
  searchKeywords?: string[];
}

type RoadmapCategory =
  | "frontend"
  | "backend"
  | "devops"
  | "mobile"
  | "data-science"
  | "design"
  | "product-management"
  | "cyber-security"
  | "cloud"
  | "blockchain"
  | "other";

type RoadmapDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

const roadmapSchema = new Schema<IRoadmap>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    slug: String,
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    longDescription: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "frontend",
        "backend",
        "devops",
        "mobile",
        "data-science",
        "design",
        "product-management",
        "cybersecurity",
        "cloud",
        "blockchain",
        "other",
      ],
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "expert"],
      default: "beginner",
    },

    estimatedDuration: {
      value: Number,
      unit: {
        type: String,
        enum: ["hours", "days", "weeks", "months"],
        default: "weeks",
      },
    },

    coverImage: {
      public_id: String,
      url: String,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isCommunityContributed: {
      type: Boolean,
      default: false,
    },

    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    tags: [String],

    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Roadmap",
      },
    ],

    stats: {
      views: {
        type: Number,
        default: 0,
      },
      completions: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5,
      },
      ratingCount: {
        type: Number,
        default: 0,
      },
    },

    version: {
      type: Number,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    lastUpdated: Date,

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Quality and regeneration tracking
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    
    qualityScore: {
      type: Number,
      default: 0,
    },
    
    needsRegeneration: {
      type: Boolean,
      default: false,
    },
    
    regenerationHistory: [{
      regeneratedAt: {
        type: Date,
        default: Date.now,
      },
      reason: String,
      previousDownvotes: Number,
    }],
    
    isPreGenerated: {
      type: Boolean,
      default: false,
    },
    
    searchKeywords: [String],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

roadmapSchema.index({
  title: 1,
});

roadmapSchema.index({
  slug: 1,
});

roadmapSchema.index({
  category: 1,
});

roadmapSchema.index({
  difficulty: 1,
});

roadmapSchema.index({
  tags: 1,
});

roadmapSchema.index({
  searchKeywords: 1,
});

roadmapSchema.index({
  isPreGenerated: 1,
});

roadmapSchema.virtual("nodes", {
  ref: "RoadmapNode",
  localField: "_id",
  foreignField: "roadmap",
});

roadmapSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "roadmap",
});

roadmapSchema.pre("save", function (next) {
  this.slug = slugify(this.title, {
    lower: true,
  });

  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate quality score based on upvotes and downvotes
  const upvotesCount = this.upvotes?.length || 0;
  const downvotesCount = this.downvotes?.length || 0;
  const totalVotes = upvotesCount + downvotesCount;
  
  if (totalVotes > 0) {
    this.qualityScore = (upvotesCount / totalVotes) * 100;
  }
  
  // Check if regeneration is needed (100+ downvotes)
  if (downvotesCount >= 100 && !this.needsRegeneration) {
    this.needsRegeneration = true;
  }
  
  // Generate search keywords from title and tags
  const titleWords = this.title.toLowerCase().split(/\s+/);
  const tagWords = this.tags || [];
  this.searchKeywords = [...new Set([...titleWords, ...tagWords])];

  next();
});

// Auto-populate contributor on find queries
// Note: Commented out to avoid issues when User model is not loaded
// roadmapSchema.pre(/^find/, function (next) {
//   (this as mongoose.Query<any, any>).populate("contributor", "username avatar");
//   next();
// });

const Roadmap = model<IRoadmap>("Roadmap", roadmapSchema);
export default Roadmap;
