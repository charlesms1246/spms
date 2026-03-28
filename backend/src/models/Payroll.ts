import mongoose, { Schema, Document } from 'mongoose';

export interface IPayroll extends Document {
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  basic: number;
  allowances: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  payslipUrl?: string;
  status: 'Draft' | 'Generated' | 'Paid';
  generatedBy?: mongoose.Types.ObjectId;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    basic: { type: Number, required: true, default: 0 },
    allowances: { type: Number, required: true, default: 0 },
    bonus: { type: Number, required: true, default: 0 },
    deductions: { type: Number, required: true, default: 0 },
    netSalary: { type: Number, required: true, default: 0 },
    payslipUrl: { type: String },
    status: {
      type: String,
      enum: ['Draft', 'Generated', 'Paid'],
      default: 'Draft',
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

// Calculate net salary before saving
PayrollSchema.pre('save', function (next) {
  this.netSalary = this.basic + this.allowances + this.bonus - this.deductions;
  next();
});

// Index for performance
PayrollSchema.index({ userId: 1 });
PayrollSchema.index({ month: 1, year: 1 });
PayrollSchema.index({ userId: 1, month: 1, year: 1 });
PayrollSchema.index({ status: 1 });

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
