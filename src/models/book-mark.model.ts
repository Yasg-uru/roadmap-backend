import mongoose, { Schema, Document, Model } from 'mongoose';
import Roadmap from './roadmap.model'; '../models/Roadmap'; 

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  roadmap: mongoose.Types.ObjectId;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bookmark must belong to a user']
    },
    roadmap: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Bookmark must reference a roadmap']
    },
    tags: [String],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
bookmarkSchema.index({ user: 1 });
bookmarkSchema.index({ roadmap: 1 });
bookmarkSchema.index({ user: 1, roadmap: 1 }, { unique: true });
bookmarkSchema.index({ isFavorite: 1 });
bookmarkSchema.index({ tags: 1 });

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

export default Bookmark;
