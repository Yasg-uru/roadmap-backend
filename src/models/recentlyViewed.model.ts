import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecentlyViewed extends Document {
  user: mongoose.Types.ObjectId;
  roadmap: mongoose.Types.ObjectId;
  viewedAt: Date;
}

const recentlyViewedSchema = new Schema<IRecentlyViewed>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmap: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ensure a single record per user+roadmap for easy upsert
recentlyViewedSchema.index({ user: 1, roadmap: 1 }, { unique: true });

const RecentlyViewed: Model<IRecentlyViewed> = mongoose.model<IRecentlyViewed>(
  'RecentlyViewed',
  recentlyViewedSchema
);

export default RecentlyViewed;
