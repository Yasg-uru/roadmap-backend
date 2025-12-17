import mongoose, { Document, Schema, model } from "mongoose";
import validator from "validator";

// TypeScript interface
export interface IResource extends Document {
  title: string;
  description?: string;
  url: string;
  resourceType:
    | "article"
    | "video"
    | "course"
    | "book"
    | "documentation"
    | "podcast"
    | "cheatsheet"
    | "tool"
    | "other";
  contentType?: "free" | "paid" | "freemium" | "subscription";
  language?:
    | "en"
    | "es"
    | "fr"
    | "de"
    | "pt"
    | "ru"
    | "zh"
    | "ja"
    | "hi"
    | "other";
  duration?: {
    value: number;
    unit: "minutes" | "hours" | "pages" | "lessons";
  };
  author?: string;
  publisher?: string;
  publishedDate?: Date;
  thumbnail?: {
    public_id?: string;
    url?: string;
  };
  difficulty?: "beginner" | "intermediate" | "advanced";
  tags?: string[];
  isCommunityContributed?: boolean;
  contributor?: mongoose.Types.ObjectId;
  upvotes?: mongoose.Types.ObjectId[];
  downvotes?: mongoose.Types.ObjectId[];
  stats?: {
    views?: number;
    clicks?: number;
    rating?: number;
    ratingsCount?: number;
  };
  isApproved?: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  calculateRating(): number;
}

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    url: {
      type: String,
      required: true,
      validate: [validator.isURL, "Please provide a valid URL"],
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        "article",
        "video",
        "course",
        "book",
        "documentation",
        "podcast",
        "cheatsheet",
        "tool",
        "other",
      ],
    },
    contentType: {
      type: String,
      enum: ["free", "paid", "freemium", "subscription"],
      default: "free",
    },
    language: {
      type: String,
      enum: ["en", "es", "fr", "de", "pt", "ru", "zh", "ja", "hi", "other"],
      default: "en",
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ["minutes", "hours", "pages", "lessons"],
        default: "minutes",
      },
    },
    author: String,
    publisher: String,
    publishedDate: Date,
    thumbnail: {
      public_id: String,
      url: String,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: [String],
    isCommunityContributed: {
      type: Boolean,
      default: false,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      ratingsCount: {
        type: Number,
        default: 0,
      },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
resourceSchema.index({ title: "text", description: "text" });
resourceSchema.index({ resourceType: 1 });
resourceSchema.index({ contentType: 1 });
resourceSchema.index({ difficulty: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ isApproved: 1 });
resourceSchema.index({ isCommunityContributed: 1 });

// Virtual fields
resourceSchema.virtual("upvotesCount").get(function () {
  return this.upvotes?.length || 0;
});

resourceSchema.virtual("downvotesCount").get(function () {
  return this.downvotes?.length || 0;
});

// Document middleware
resourceSchema.pre("save", function (next) {
  if (this.isModified("upvotes") || this.isModified("downvotes")) {
    if (this.stats) {
      this.stats.rating = this.calculateRating();
    }
  }
  next();
});

// Instance method - now ratings come from reviews, not upvotes/downvotes
resourceSchema.methods.calculateRating = function () {
  // This method is kept for backward compatibility but ratings are now calculated from reviews
  // The actual calculation happens in the ResourceReview model's calculateAverageRating method
  return this.stats?.rating || 0;
};

const Resource = model<IResource>("Resource", resourceSchema);

export default Resource;
