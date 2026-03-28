import { Response } from 'express';
import Payroll from '../models/Payroll';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get user's payroll records
export const getMyPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const payroll = await Payroll.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ payroll, total: payroll.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get payroll by ID
export const getPayrollById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('userId', 'firstName lastName email').populate('generatedBy', 'firstName lastName');

    if (!payroll) {
      res.status(404).json({ message: 'Payroll not found' });
      return;
    }

    res.json({ payroll });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Generate payroll (Admin only)
export const generatePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { month, year, userIds } = req.body;

    if (!month || !year) {
      res.status(400).json({ message: 'Month and year are required' });
      return;
    }

    // Get all users or specific users
    const filter: any = {};
    if (userIds && userIds.length > 0) {
      filter._id = { $in: userIds };
    }

    const users = await User.find(filter);
    const payrolls = [];

    for (const user of users) {
      // Check if payroll already exists
      const existing = await Payroll.findOne({
        userId: user._id,
        month,
        year,
      });

      if (existing && existing.status !== 'Draft') {
        continue;
      }

      const payroll = await Payroll.findByIdAndUpdate(
        existing?._id,
        {
          userId: user._id,
          month,
          year,
          basic: user.salary?.basic || 0,
          allowances: user.salary?.allowances || 0,
          bonus: user.salary?.bonus || 0,
          deductions: user.salary?.deductions || 0,
          status: 'Generated',
          generatedBy: req.user.id,
        },
        { new: true, upsert: true }
      );

      payrolls.push(payroll);
    }

    res.json({
      message: 'Payroll generated successfully',
      payrolls,
      total: payrolls.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payroll records (Admin)
export const getAllPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, status, userId } = req.query;
    const filter: any = {};

    if (month) filter.month = parseInt(month as string);
    if (year) filter.year = parseInt(year as string);
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const payroll = await Payroll.find(filter)
      .populate('userId', 'firstName lastName email employeeId')
      .populate('generatedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ payroll, total: payroll.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark payroll as paid
export const markPayrollAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Paid',
        paidDate: new Date(),
      },
      { new: true }
    );

    if (!payroll) {
      res.status(404).json({ message: 'Payroll not found' });
      return;
    }

    res.json({ message: 'Payroll marked as paid', payroll });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get salary details for user
export const getSalaryDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.id).select('salary');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const netSalary = (user.salary?.basic || 0) + (user.salary?.allowances || 0) + (user.salary?.bonus || 0) - (user.salary?.deductions || 0);

    res.json({
      salary: {
        ...(user.salary || {}),
        netSalary,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update salary structure (Admin only)
export const updateSalaryStructure = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, basic, allowances, bonus, deductions } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        salary: {
          basic: basic || 0,
          allowances: allowances || 0,
          bonus: bonus || 0,
          deductions: deductions || 0,
        },
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'Salary structure updated', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
