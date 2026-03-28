import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Get all users (Admin only)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, role, status } = req.query;
    const filter: any = {};

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password').populate('manager', 'firstName lastName');
    res.json({ users, total: users.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('manager', 'firstName lastName');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (Admin only)
export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, employeeId, department, designation, role, manager, joiningDate } = req.body;

    if (!firstName || !lastName || !email || !password || !employeeId || !department || !designation) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      res.status(409).json({ message: 'Email or Employee ID already exists' });
      return;
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      employeeId,
      department,
      designation,
      role: role || 'Employee',
      manager,
      joiningDate: joiningDate || new Date(),
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, firstName, lastName, email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, department, designation, manager, status, salary } = req.body;
    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (designation) updateData.designation = designation;
    if (manager) updateData.manager = manager;
    if (status) updateData.status = status;
    if (salary) updateData.salary = salary;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get team (for managers)
export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const team = await User.find({ manager: req.user.id }).select('-password');
    res.json({ team, total: team.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ message: 'Search query required' });
      return;
    }

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { employeeId: { $regex: query, $options: 'i' } },
      ],
    }).select('-password');

    res.json({ users, total: users.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
