import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  userId: mongoose.Types.ObjectId;
  leaveType: 'Annual' | 'Sick' | 'Casual';
  startDate: Date;
  endDate: Date;
  daysRequested: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
      type: String,
      enum: ['Annual', 'Sick', 'Casual'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    daysRequested: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Index for performance
LeaveRequestSchema.index({ userId: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ userId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
