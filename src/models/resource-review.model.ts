import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceReview extends Document {
  resource: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  review: string;
  pros?: string[];
  cons?: string[];
  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

interface ResourceReviewModel extends Model<IResourceReview> {
  calculateAverageRating(resourceId: mongoose.Types.ObjectId): Promise<void>;
}

const resourceReviewSchema = new Schema<IResourceReview, ResourceReviewModel>(
  {
    resource: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Review must belong to a resource']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5']
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    review: {
      type: String,
      required: [true, 'Review must have a description'],
      trim: true,
      maxlength: [1000, 'Review cannot be more than 1000 characters']
    },
    pros: [{
      type: String,
      trim: true,
      maxlength: [200, 'Pro cannot be more than 200 characters']
    }],
    cons: [{
      type: String,
      trim: true,
      maxlength: [200, 'Con cannot be more than 200 characters']
    }],
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
resourceReviewSchema.index({ resource: 1, user: 1 }, { unique: true });
resourceReviewSchema.index({ rating: 1 });

// Virtual for helpful votes (could be expanded later)
resourceReviewSchema.virtual('helpfulCount').get(function() {
  return 0; // Placeholder for future helpful votes feature
});

// Static method to calculate average rating for a resource
resourceReviewSchema.statics.calculateAverageRating = async function (resourceId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { resource: resourceId }
    },
    {
      $group: {
        _id: '$resource',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
      'stats.rating': Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
      'stats.ratingsCount': stats[0].nRating
    });
  } else {
    await mongoose.model('Resource').findByIdAndUpdate(resourceId, {
      'stats.rating': 0,
      'stats.ratingsCount': 0
    });
  }
};

// Post save middleware
resourceReviewSchema.post('save', function(doc: IResourceReview) {
  // Use the model to call the static method
  ResourceReview.calculateAverageRating(doc.resource);
});

// Post remove middleware
resourceReviewSchema.post('deleteOne', function(doc: IResourceReview) {
  // Use the model to call the static method
  ResourceReview.calculateAverageRating(doc.resource);
});

const ResourceReview = mongoose.model<IResourceReview, ResourceReviewModel>('ResourceReview', resourceReviewSchema);

export default ResourceReview;