import { Response } from 'express';
import Attendance from '../models/Attendance';
import { AuthRequest } from '../middleware/auth';

// Check in
export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: today },
    });

    if (attendance && attendance.checkInTime) {
      res.status(400).json({ message: 'Already checked in today' });
      return;
    }

    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: new Date(),
        checkInTime: new Date(),
      });
    } else {
      attendance.checkInTime = new Date();
    }

    await attendance.save();
    res.json({ message: 'Checked in successfully', attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Check out
export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: today },
    });

    if (!attendance) {
      res.status(404).json({ message: 'No check-in record found for today' });
      return;
    }

    if (attendance.checkOutTime) {
      res.status(400).json({ message: 'Already checked out today' });
      return;
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's attendance
export const getTodayAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: { $gte: today },
    });

    res.json({ attendance: attendance || null });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records
export const getAttendanceRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, startDate, endDate, status } = req.query;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const records = await Attendance.find(filter).populate('userId', 'firstName lastName email');
    res.json({ records, total: records.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance statistics
export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, month, year } = req.query;
    const id = userId || req.user?.id;

    const startDate = new Date(parseInt(year as string) || new Date().getFullYear(), parseInt(month as string) - 1 || new Date().getMonth(), 1);
    const endDate = new Date(parseInt(year as string) || new Date().getFullYear(), parseInt(month as string) || new Date().getMonth() + 1, 0);

    const records = await Attendance.find({
      userId: id,
      date: { $gte: startDate, $lte: endDate },
    });

    const present = records.filter((r) => r.status === 'Present').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const avgWorkHours = records.length > 0 ? totalWorkHours / records.length : 0;

    const attendancePercentage = records.length > 0 ? ((present + late) / records.length) * 100 : 0;

    res.json({
      stats: {
        present,
        late,
        absent,
        totalDays: records.length,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
        avgWorkHours: parseFloat(avgWorkHours.toFixed(2)),
        totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get team attendance (manager)
export const getTeamAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { date } = req.query;
    const filterDate = date ? new Date(date as string) : new Date();
    filterDate.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: { $gte: filterDate } })
      .populate('userId', 'firstName lastName email department')
      .sort({ createdAt: -1 });

    res.json({ attendance });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
