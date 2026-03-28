import { Response } from 'express';
import PerformanceReview from '../models/PerformanceReview';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Add performance review (Manager only)
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { userId, quality, teamwork, communication, leadership, comments, reviewDate } = req.body;

    if (!userId || quality === undefined || teamwork === undefined || communication === undefined || leadership === undefined || !comments) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Validate rating values
    if (quality < 0 || quality > 5 || teamwork < 0 || teamwork > 5 || communication < 0 || communication > 5 || leadership < 0 || leadership > 5) {
      res.status(400).json({ message: 'Ratings must be between 0 and 5' });
      return;
    }

    const review = new PerformanceReview({
      userId,
      reviewedBy: req.user.id,
      quality,
      teamwork,
      communication,
      leadership,
      comments,
      reviewDate: reviewDate || new Date(),
    });

    await review.save();

    res.status(201).json({
      message: 'Performance review added successfully',
      review,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's performance reviews
export const getMyReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const reviews = await PerformanceReview.find({ userId: req.user.id })
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ reviewDate: -1 });

    // Calculate trends
    const latestReview = reviews[0];
    const trends = reviews.length > 1 ? {
      quality: reviews[0].quality - reviews[1].quality,
      teamwork: reviews[0].teamwork - reviews[1].teamwork,
      communication: reviews[0].communication - reviews[1].communication,
      leadership: reviews[0].leadership - reviews[1].leadership,
    } : null;

    res.json({ reviews, total: reviews.length, latestReview, trends });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get team performance reviews (Manager)
export const getTeamReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // Get team members
    const teamMembers = await User.find({ manager: req.user.id }).select('_id');
    const teamIds = teamMembers.map((m) => m._id);

    const reviews = await PerformanceReview.find({ userId: { $in: teamIds } })
      .populate('userId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ reviewDate: -1 });

    res.json({ reviews, total: reviews.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all performance reviews (Admin)
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reviewedBy, startDate, endDate } = req.query;
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (reviewedBy) filter.reviewedBy = reviewedBy;

    if (startDate || endDate) {
      filter.reviewDate = {};
      if (startDate) filter.reviewDate.$gte = new Date(startDate as string);
      if (endDate) filter.reviewDate.$lte = new Date(endDate as string);
    }

    const reviews = await PerformanceReview.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ reviewDate: -1 });

    res.json({ reviews, total: reviews.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get performance history for a user
export const getUserPerformanceHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const reviews = await PerformanceReview.find({ userId })
      .populate('reviewedBy', 'firstName lastName')
      .sort({ reviewDate: -1 });

    if (reviews.length === 0) {
      res.status(404).json({ message: 'No performance reviews found' });
      return;
    }

    // Calculate statistics
    const avgRating = {
      quality: (reviews.reduce((sum, r) => sum + r.quality, 0) / reviews.length).toFixed(2),
      teamwork: (reviews.reduce((sum, r) => sum + r.teamwork, 0) / reviews.length).toFixed(2),
      communication: (reviews.reduce((sum, r) => sum + r.communication, 0) / reviews.length).toFixed(2),
      leadership: (reviews.reduce((sum, r) => sum + r.leadership, 0) / reviews.length).toFixed(2),
      overall: (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(2),
    };

    res.json({ reviews, avgRating, total: reviews.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update performance review
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quality, teamwork, communication, leadership, comments } = req.body;
    const updateData: any = {};

    if (quality !== undefined) updateData.quality = quality;
    if (teamwork !== undefined) updateData.teamwork = teamwork;
    if (communication !== undefined) updateData.communication = communication;
    if (leadership !== undefined) updateData.leadership = leadership;
    if (comments) updateData.comments = comments;

    const review = await PerformanceReview.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!review) {
      res.status(404).json({ message: 'Performance review not found' });
      return;
    }

    res.json({ message: 'Performance review updated', review });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete performance review
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await PerformanceReview.findByIdAndDelete(req.params.id);

    if (!review) {
      res.status(404).json({ message: 'Performance review not found' });
      return;
    }

    res.json({ message: 'Performance review deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
