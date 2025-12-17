import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'system' | 'progress' | 'roadmap_update' | 'new_resource' | 'community' | 'promotional';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  icon?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to a user']
    },
    title: {
      type: String,
      required: [true, 'Notification must have a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification must have a message'],
      trim: true,
      maxlength: [500, 'Message cannot be more than 500 characters']
    },
    type: {
      type: String,
      required: [true, 'Notification must have a type'],
      enum: {
        values: ['system', 'progress', 'roadmap_update', 'new_resource', 'community', 'promotional'],
        message:
          'Type is either: system, progress, roadmap_update, new_resource, community, promotional'
      }
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    actionUrl: String,
    icon: String,
    metadata: Schema.Types.Mixed,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Query middleware
import type { Query } from 'mongoose';

notificationSchema.pre(/^find/, function (this: Query<any, INotification>, next) {
  this.sort({ createdAt: -1 });
  next();
});

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
