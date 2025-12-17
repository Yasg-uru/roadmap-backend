import mongoose, { Schema, Document, Model, Query } from 'mongoose';

export type SubmissionType = 'roadmap' | 'resource' | 'node' | 'update';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'merged';

export interface IContentSubmission extends Document {
  type: SubmissionType;
  user: mongoose.Types.ObjectId;
  status: SubmissionStatus;
  roadmap?: mongoose.Types.ObjectId;
  node?: mongoose.Types.ObjectId;
  resource?: mongoose.Types.ObjectId;
  data?: any; // Mixed type
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const submissionSchema = new Schema<IContentSubmission>(
  {
    type: {
      type: String,
      required: [true, 'Submission must have a type'],
      enum: {
        values: ['roadmap', 'resource', 'node', 'update'],
        message: 'Type is either: roadmap, resource, node, update',
      },
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submission must belong to a user'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'merged'],
      default: 'pending',
    },
    roadmap: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    node: {
      type: Schema.Types.ObjectId,
      ref: 'RoadmapNode',
    },
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    data: Schema.Types.Mixed,
    reviewNotes: String,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
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
submissionSchema.index({ type: 1 });
submissionSchema.index({ user: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ roadmap: 1 });
submissionSchema.index({ node: 1 });
submissionSchema.index({ resource: 1 });

// Query middleware
// submissionSchema.pre(/^find/, function (next) {
//   this.populate ({
//     path: 'user',
//     select: 'username avatar',
//   }).populate({
//     path: 'reviewedBy',
//     select: 'username avatar',
//   });
//   next();
// });

submissionSchema.pre(/^find/, function (
  this: Query<any, IContentSubmission>,
  next
) {
  this.populate({
    path: 'user',
    select: 'username avatar',
  }).populate({
    path: 'reviewedBy',
    select: 'username avatar',
  });

  next();
});





const ContentSubmission: Model<IContentSubmission> = mongoose.model<IContentSubmission>(
  'ContentSubmission',
  submissionSchema
);

export default ContentSubmission;
