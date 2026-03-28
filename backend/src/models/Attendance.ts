import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: 'Present' | 'Late' | 'Absent';
  workHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent'],
      default: 'Absent',
    },
    workHours: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

// Calculate work hours before saving
AttendanceSchema.pre('save', function (next) {
  if (this.checkInTime && this.checkOutTime) {
    const checkIn = new Date(this.checkInTime).getTime();
    const checkOut = new Date(this.checkOutTime).getTime();
    this.workHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert ms to hours
  }

  // Set status based on check-in time
  if (this.checkInTime) {
    const checkInDate = new Date(this.checkInTime);
    const hour = checkInDate.getHours();
    const minute = checkInDate.getMinutes();
    const checkInMinutes = hour * 60 + minute;
    const lateMinutes = 9 * 60 + 15; // 9:15 AM

    this.status = checkInMinutes <= lateMinutes ? 'Present' : 'Late';
  }
  next();
});

// Index for performance
AttendanceSchema.index({ userId: 1, date: 1 });
AttendanceSchema.index({ userId: 1 });
AttendanceSchema.index({ date: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
