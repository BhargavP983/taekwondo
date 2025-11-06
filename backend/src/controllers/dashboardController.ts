import { Request, Response } from 'express';
import { User } from '../models/user';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalCadets = await Cadet.countDocuments();
    const totalPoomsae = await Poomsae.countDocuments();

    // Get active users count
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCadets = await Cadet.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentPoomsae = await Poomsae.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get user breakdown by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get cadet breakdown by state
    const cadetsByState = await Cadet.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get cadet breakdown by gender
    const cadetsByGender = await Cadet.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Get poomsae breakdown by division
    const poomsaeByDivision = await Poomsae.aggregate([
      { $group: { _id: '$division', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent registrations
    const recentRegistrations = await Cadet.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('entryId name state createdAt');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalCadets,
          totalPoomsae,
          totalApplications: totalCadets + totalPoomsae,
          recentCadets,
          recentPoomsae
        },
        usersByRole,
        cadetsByState,
        cadetsByGender,
        poomsaeByDivision,
        recentRegistrations
      }
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard statistics'
    });
  }
};

export const getRecentActivities = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent cadet registrations
    const recentCadets = await Cadet.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('entryId name state createdAt')
      .lean();

    // Get recent poomsae registrations
    const recentPoomsae = await Poomsae.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('entryId name stateOrg createdAt')
      .lean();

    // Get recent user registrations
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name email role createdAt')
      .lean();

    // Combine and sort all activities
    const activities = [
      ...recentCadets.map(c => ({
        type: 'cadet',
        id: c.entryId,
        title: `New Cadet Registration: ${c.name}`,
        description: `State: ${c.state}`,
        timestamp: c.createdAt
      })),
      ...recentPoomsae.map(p => ({
        type: 'poomsae',
        id: p.entryId,
        title: `New Poomsae Registration: ${p.name}`,
        description: `State: ${p.stateOrg}`,
        timestamp: p.createdAt
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        id: u._id,
        title: `New User Registration: ${u.name}`,
        description: `Role: ${u.role}`,
        timestamp: u.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activities'
    });
  }
};


//state-admin controller
export const getStateAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const userState = (req.user as any)?.state; // Get state from authenticated user

    if (!userState) {
      return res.status(400).json({
        success: false,
        message: 'State information not found for this admin'
      });
    }

    // Get total counts for this state
    const totalCadets = await Cadet.countDocuments({ state: userState });
    const totalPoomsae = await Poomsae.countDocuments({ stateOrg: userState });

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCadets = await Cadet.countDocuments({
      state: userState,
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentPoomsae = await Poomsae.countDocuments({
      stateOrg: userState,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get cadet breakdown by gender in this state
    const cadetsByGender = await Cadet.aggregate([
      { $match: { state: userState } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Get cadet breakdown by district in this state
    const cadetsByDistrict = await Cadet.aggregate([
      { $match: { state: userState } },
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get poomsae breakdown by division in this state
    const poomsaeByDivision = await Poomsae.aggregate([
      { $match: { stateOrg: userState } },
      { $group: { _id: '$division', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get poomsae breakdown by category
    const poomsaeByCategory = await Poomsae.aggregate([
      { $match: { stateOrg: userState } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get recent registrations for this state
    const recentRegistrations = await Cadet.find({ state: userState })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('entryId name state createdAt');

    res.status(200).json({
      success: true,
      data: {
        state: userState,
        overview: {
          totalCadets,
          totalPoomsae,
          totalApplications: totalCadets + totalPoomsae,
          recentCadets,
          recentPoomsae
        },
        cadetsByGender,
        cadetsByDistrict,
        poomsaeByDivision,
        poomsaeByCategory,
        recentRegistrations
      }
    });
  } catch (error: any) {
    console.error('State admin stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch state statistics'
    });
  }
};

export const getStateAdminActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userState = (req.user as any)?.state;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userState) {
      return res.status(400).json({
        success: false,
        message: 'State information not found'
      });
    }

    // Get recent cadet registrations in this state
    const recentCadets = await Cadet.find({ state: userState })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('entryId name state createdAt')
      .lean();

    // Get recent poomsae registrations in this state
    const recentPoomsae = await Poomsae.find({ stateOrg: userState })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('entryId name stateOrg createdAt')
      .lean();

    // Combine and sort activities
    const activities = [
      ...recentCadets.map(c => ({
        type: 'cadet',
        id: c.entryId,
        title: `New Cadet Registration: ${c.name}`,
        description: `State: ${c.state}`,
        timestamp: c.createdAt
      })),
      ...recentPoomsae.map(p => ({
        type: 'poomsae',
        id: p.entryId,
        title: `New Poomsae Registration: ${p.name}`,
        description: `State: ${p.stateOrg}`,
        timestamp: p.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch activities'
    });
  }
};
