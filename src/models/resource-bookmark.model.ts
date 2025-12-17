import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceBookmark extends Document {
  user: mongoose.Types.ObjectId;
  resource: mongoose.Types.ObjectId;
  tags?: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resourceBookmarkSchema = new Schema<IResourceBookmark>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bookmark must belong to a user']
  },
  resource: {
    type: Schema.Types.ObjectId,
    ref: 'Resource',
    required: [true, 'Bookmark must reference a resource']
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

resourceBookmarkSchema.index({ user: 1 });
resourceBookmarkSchema.index({ resource: 1 });
resourceBookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });
resourceBookmarkSchema.index({ isFavorite: 1 });
resourceBookmarkSchema.index({ tags: 1 });

const ResourceBookmark = mongoose.model<IResourceBookmark>('ResourceBookmark', resourceBookmarkSchema);
export default ResourceBookmark;
