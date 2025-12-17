import mongoose, { Schema, Document, Model } from 'mongoose';

interface ITopViewedRoadmap {
  roadmap: mongoose.Types.ObjectId;
  views: number;
}

interface ITopCompletedRoadmap {
  roadmap: mongoose.Types.ObjectId;
  completions: number;
}

interface ITopClickedResource {
  resource: mongoose.Types.ObjectId;
  clicks: number;
}

interface ILocation {
  country?: string;
  region?: string;
  users: number;
}

interface IReferrer {
  source?: string;
  count: number;
}

export interface IAnalytics extends Document {
  date: Date;
  users: {
    total: number;
    new: number;
    active: number;
  };
  roadmaps: {
    views: number;
    topViewed: ITopViewedRoadmap[];
    topCompleted: ITopCompletedRoadmap[];
  };
  resources: {
    clicks: number;
    topClicked: ITopClickedResource[];
  };
  engagement: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locations: ILocation[];
  referrers: IReferrer[];
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    date: {
      type: Date,
      required: [true, 'Analytics record must have a date'],
      index: true,
      unique: true
    },
    users: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 }
    },
    roadmaps: {
      views: { type: Number, default: 0 },
      topViewed: [
        {
          roadmap: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
          views: { type: Number, default: 0 }
        }
      ],
      topCompleted: [
        {
          roadmap: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
          completions: { type: Number, default: 0 }
        }
      ]
    },
    resources: {
      clicks: { type: Number, default: 0 },
      topClicked: [
        {
          resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
          clicks: { type: Number, default: 0 }
        }
      ]
    },
    engagement: {
      averageSessionDuration: { type: Number, default: 0 },
      pagesPerSession: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 }
    },
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 }
    },
    locations: [
      {
        country: String,
        region: String,
        users: { type: Number, default: 0 }
      }
    ],
    referrers: [
      {
        source: String,
        count: { type: Number, default: 0 }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

analyticsSchema.index({ date: 1 }, { unique: true });

const Analytics: Model<IAnalytics> = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;
