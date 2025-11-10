import { Response } from 'express';
import { PipelineStage } from 'mongoose';
import { User } from '../models/user';
import { Cadet } from '../models/cadet';
import { Poomsae } from '../models/poomsae';
import { AuthRequest } from '../middleware/authMiddleware';
import { DashboardStats, ApiResponse } from '../types/api';

interface QueryFilter extends Record<string, any> {
  state?: string;
  district?: string;
  isActive?: boolean;
  createdAt?: { $gte: Date };
}

interface RoleStats {
  role: string;
  count: number;
}

interface Activity {
  type: 'cadet' | 'poomsae' | 'user';
  id: string;
  title: string;
  description: string;
  timestamp: Date;
}

export async function getDashboardStats(
  req: AuthRequest,
  res: Response<ApiResponse<DashboardStats>>
): Promise<void> {
  try {
    const query: QueryFilter = {};
    
    if (req.user?.role === 'stateAdmin' && req.user.state) {
      query.state = req.user.state;
    } else if (req.user?.role === 'districtAdmin' && req.user.district) {
      query.district = req.user.district;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get counts in parallel for better performance
    const [counts, userRoleResults] = await Promise.all([
      Promise.all([
        User.countDocuments(query),
        Cadet.countDocuments(query),
        Poomsae.countDocuments(query),
        User.countDocuments({ ...query, isActive: true }),
        Cadet.countDocuments({ ...query, createdAt: { $gte: sevenDaysAgo } }),
        Poomsae.countDocuments({ ...query, createdAt: { $gte: sevenDaysAgo } })
      ]),
      User.aggregate<RoleStats>([
        { 
          $match: query 
        } as PipelineStage,
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        } as PipelineStage,
        {
          $project: {
            _id: 0,
            role: '$_id',
            count: 1
          }
        } as PipelineStage,
        {
          $sort: { 
            role: 1 
          }
        } as PipelineStage
      ])
    ]);

    const [
      totalUsers,
      totalCadets,
      totalPoomsae,
      activeUsers,
      recentCadets,
      recentPoomsae
    ] = counts;

    const stats: DashboardStats = {
      totalUsers,
      totalCadets,
      totalPoomsae,
      activeUsers,
      recentCadets,
      recentPoomsae,
      usersByRole: userRoleResults
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard statistics';
    res.status(500).json({
      success: false,
      status: 500,
      message
    });
  }
}

export async function getRecentActivities(
  req: AuthRequest,
  res: Response<ApiResponse<Activity[]>>
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const state = req.user?.state;

    const query = state ? { state } : {};
    const poomsaeQuery = state ? { stateOrg: state } : {};

    const [recentCadets, recentPoomsae, recentUsers] = await Promise.all([
      Cadet.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('entryId name state createdAt')
        .lean(),
      Poomsae.find(poomsaeQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('entryId name stateOrg createdAt')
        .lean(),
      User.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name email role createdAt')
        .lean()
    ]);

    const activities: Activity[] = [
      ...recentCadets.map(c => ({
        type: 'cadet' as const,
        id: c.entryId,
        title: `New Cadet Registration: ${c.name}`,
        description: `State: ${c.state}`,
        timestamp: c.createdAt as Date | undefined
      })),
      ...recentPoomsae.map(p => ({
        type: 'poomsae' as const,
        id: p.entryId,
        title: `New Poomsae Registration: ${p.name}`,
        description: `State: ${p.stateOrg}`,
        timestamp: p.createdAt as Date | undefined
      })),
      ...recentUsers.map(u => ({
        type: 'user' as const,
        id: u._id.toString(),
        title: `New User Registration: ${u.name}`,
        description: `Role: ${u.role}`,
        timestamp: u.createdAt as Date | undefined
      }))
    ]
      .filter((a): a is Activity => a.timestamp !== undefined)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    res.status(500).json({
      success: false,
      status: 500,
      message
    });
  }
}