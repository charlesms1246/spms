import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  employeeId: string;
  department: string;
  designation: string;
  role: 'Employee' | 'Manager' | 'Admin';
  manager?: mongoose.Types.ObjectId;
  status: 'Active' | 'Inactive' | 'On Leave';
  salary?: {
    basic: number;
    allowances: number;
    bonus: number;
    deductions: number;
  };
  joiningDate: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    role: {
      type: String,
      enum: ['Employee', 'Manager', 'Admin'],
      default: 'Employee',
    },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
    },
    salary: {
      basic: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
    },
    joiningDate: { type: Date, required: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcryptjs.compare(password, this.password);
};

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ department: 1 });

export default mongoose.model<IUser>('User', UserSchema);
