import { Response } from 'express';
import LeaveRequest from '../models/LeaveRequest';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Apply for leave
export const applyLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      res.status(400).json({ message: 'Start date must be before end date' });
      return;
    }

    const daysRequested = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave limits
    const leaveLimits: any = { Annual: 20, Sick: 10, Casual: 7 };
    if (daysRequested > leaveLimits[leaveType]) {
      res.status(400).json({ message: `Cannot request more than ${leaveLimits[leaveType]} days for ${leaveType} leave` });
      return;
    }

    const leaveRequest = new LeaveRequest({
      userId: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      daysRequested,
      reason,
    });

    await leaveRequest.save();

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave: leaveRequest,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's leave requests
export const getMyLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const leaves = await LeaveRequest.find({ userId: req.user.id })
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ leaves, total: leaves.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all leave requests (Admin/Manager)
export const getAllLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, userId, startDate, endDate } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    if (startDate || endDate) {
      filter.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
      ];
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('userId', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ leaves, total: leaves.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending leave requests (for manager/admin approval)
export const getPendingLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    let leaves;

    if (req.user.role === 'Admin') {
      // Admin sees pending leaves from Managers only
      const managers = await User.find({ role: 'Manager' }).select('_id');
      const managerIds = managers.map((m) => m._id);

      leaves = await LeaveRequest.find({
        userId: { $in: managerIds },
        status: 'Pending',
      })
        .populate('userId', 'firstName lastName email department role')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Manager') {
      // Manager sees pending leaves from Admins only
      const admins = await User.find({ role: 'Admin' }).select('_id');
      const adminIds = admins.map((a) => a._id);

      leaves = await LeaveRequest.find({
        userId: { $in: adminIds },
        status: 'Pending',
      })
        .populate('userId', 'firstName lastName email department role')
        .sort({ createdAt: -1 });
    } else {
      // Employees cannot approve leaves
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    res.json({ leaves, total: leaves.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve leave
export const approveLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Get the leave request
    const leaveRequest = await LeaveRequest.findById(req.params.id).populate('userId', 'role');

    if (!leaveRequest) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    // Admin can approve Manager's leaves
    // Manager can approve Admin's leaves
    const userRole = req.user.role;
    const requesterRole = (leaveRequest.userId as any).role;

    if (userRole === 'Admin' && requesterRole !== 'Manager') {
      res.status(403).json({ message: 'Admins can only approve Manager leaves' });
      return;
    }

    if (userRole === 'Manager' && requesterRole !== 'Admin') {
      res.status(403).json({ message: 'Managers can only approve Admin leaves' });
      return;
    }

    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user.id,
        approvalDate: new Date(),
      },
      { new: true }
    );

    res.json({ message: 'Leave approved successfully', leave });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject leave
export const rejectLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Get the leave request
    const leaveRequest = await LeaveRequest.findById(req.params.id).populate('userId', 'role');

    if (!leaveRequest) {
      res.status(404).json({ message: 'Leave request not found' });
      return;
    }

    // Admin can reject Manager's leaves
    // Manager can reject Admin's leaves
    const userRole = req.user.role;
    const requesterRole = (leaveRequest.userId as any).role;

    if (userRole === 'Admin' && requesterRole !== 'Manager') {
      res.status(403).json({ message: 'Admins can only reject Manager leaves' });
      return;
    }

    if (userRole === 'Manager' && requesterRole !== 'Admin') {
      res.status(403).json({ message: 'Managers can only reject Admin leaves' });
      return;
    }

    const { rejectionReason } = req.body;

    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        approvedBy: req.user.id,
        approvalDate: new Date(),
        rejectionReason,
      },
      { new: true }
    );

    res.json({ message: 'Leave rejected successfully', leave });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get leave balance
export const getLeaveBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { year } = req.query;
    const filterYear = parseInt(year as string) || new Date().getFullYear();

    const leaves = await LeaveRequest.find({
      userId: req.user.id,
      status: 'Approved',
      startDate: { $gte: new Date(`${filterYear}-01-01`), $lte: new Date(`${filterYear}-12-31`) },
    });

    const totalUsed = leaves.reduce((sum, leave) => sum + leave.daysRequested, 0);

    const leaveTypes = {
      Annual: 20,
      Sick: 10,
      Casual: 7,
    };

    const balance = {
      Annual: leaveTypes.Annual - (leaves.filter((l) => l.leaveType === 'Annual').reduce((sum, l) => sum + l.daysRequested, 0) || 0),
      Sick: leaveTypes.Sick - (leaves.filter((l) => l.leaveType === 'Sick').reduce((sum, l) => sum + l.daysRequested, 0) || 0),
      Casual: leaveTypes.Casual - (leaves.filter((l) => l.leaveType === 'Casual').reduce((sum, l) => sum + l.daysRequested, 0) || 0),
    };

    res.json({ balance, totalUsed });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
