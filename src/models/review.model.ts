import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  roadmap: mongoose.Types.ObjectId;
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

interface ReviewModel extends Model<IReview> {
  calculateAverageRating(roadmapId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    roadmap: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Review must belong to a roadmap']
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
      maxlength: [100, 'Pro cannot be more than 100 characters']
    }],
    cons: [{
      type: String,
      trim: true,
      maxlength: [100, 'Con cannot be more than 100 characters']
    }],
    isVerified: {
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
reviewSchema.index({ roadmap: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ roadmap: 1, user: 1 }, { unique: true });

// Prevent duplicate reviews from the same user
reviewSchema.pre('save', async function (next) {
  const existingReview = await Review.findOne({
    roadmap: this.roadmap,
    user: this.user,
    _id: { $ne: this._id }
  });

  if (existingReview) {
    const err = new Error('You have already reviewed this roadmap') as any;
    err.statusCode = 400;
    return next(err);
  }
  next();
});

// Trigger recalculation on save
reviewSchema.post('save', async function () {
  await Review.calculateAverageRating(this.roadmap);
});

// Trigger recalculation on delete
reviewSchema.post('findOneAndDelete', async function (doc: IReview) {
  if (doc) {
    await Review.calculateAverageRating(doc.roadmap);
  }
});

// Removed 'findByIdAndDelete' middleware as it's not supported by Mongoose

// Static method to update roadmap stats
reviewSchema.statics.calculateAverageRating = async function (roadmapId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    { $match: { roadmap: roadmapId } },
    {
      $group: {
        _id: '$roadmap',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Roadmap').findByIdAndUpdate(roadmapId, {
      'stats.averageRating': stats[0].avgRating,
      'stats.ratingsCount': stats[0].nRating
    });
  } else {
    await mongoose.model('Roadmap').findByIdAndUpdate(roadmapId, {
      'stats.averageRating': 4.5,
      'stats.ratingsCount': 0
    });
  }
};

const Review = mongoose.model<IReview, ReviewModel>('Review', reviewSchema);

export default Review;
