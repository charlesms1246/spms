import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceReview extends Document {
  userId: mongoose.Types.ObjectId;
  reviewedBy: mongoose.Types.ObjectId;
  quality: number;
  teamwork: number;
  communication: number;
  leadership: number;
  overallRating: number;
  comments: string;
  reviewDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceReviewSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quality: { type: Number, required: true, min: 0, max: 5 },
    teamwork: { type: Number, required: true, min: 0, max: 5 },
    communication: { type: Number, required: true, min: 0, max: 5 },
    leadership: { type: Number, required: true, min: 0, max: 5 },
    overallRating: { type: Number, default: 0 },
    comments: { type: String, required: true },
    reviewDate: { type: Date, required: true },
  },
  { timestamps: true }
);

// Calculate overall rating before saving
PerformanceReviewSchema.pre('save', function (next) {
  this.overallRating = (this.quality + this.teamwork + this.communication + this.leadership) / 4;
  next();
});

// Index for performance
PerformanceReviewSchema.index({ userId: 1 });
PerformanceReviewSchema.index({ reviewedBy: 1 });
PerformanceReviewSchema.index({ userId: 1, reviewDate: -1 });

export default mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
