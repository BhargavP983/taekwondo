"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getRecentActivities = getRecentActivities;
const user_1 = require("../models/user");
const cadet_1 = require("../models/cadet");
const poomsae_1 = require("../models/poomsae");
async function getDashboardStats(req, res) {
    try {
        const query = {};
        if (req.user?.role === 'stateAdmin' && req.user.state) {
            query.state = req.user.state;
        }
        else if (req.user?.role === 'districtAdmin' && req.user.district) {
            query.district = req.user.district;
        }
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        // Get counts in parallel for better performance
        const [counts, userRoleResults] = await Promise.all([
            Promise.all([
                user_1.User.countDocuments(query),
                cadet_1.Cadet.countDocuments(query),
                poomsae_1.Poomsae.countDocuments(query),
                user_1.User.countDocuments({ ...query, isActive: true }),
                cadet_1.Cadet.countDocuments({ ...query, createdAt: { $gte: sevenDaysAgo } }),
                poomsae_1.Poomsae.countDocuments({ ...query, createdAt: { $gte: sevenDaysAgo } })
            ]),
            user_1.User.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        role: '$_id',
                        count: 1
                    }
                },
                {
                    $sort: {
                        role: 1
                    }
                }
            ])
        ]);
        const [totalUsers, totalCadets, totalPoomsae, activeUsers, recentCadets, recentPoomsae] = counts;
        const stats = {
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
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch dashboard statistics';
        res.status(500).json({
            success: false,
            status: 500,
            message
        });
    }
}
async function getRecentActivities(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const state = req.user?.state;
        const query = state ? { state } : {};
        const poomsaeQuery = state ? { stateOrg: state } : {};
        const [recentCadets, recentPoomsae, recentUsers] = await Promise.all([
            cadet_1.Cadet.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('entryId name state createdAt')
                .lean(),
            poomsae_1.Poomsae.find(poomsaeQuery)
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('entryId name stateOrg createdAt')
                .lean(),
            user_1.User.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('_id name role createdAt')
                .lean()
        ]);
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
        ]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
        res.status(200).json({
            success: true,
            data: activities
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch activities';
        res.status(500).json({
            success: false,
            status: 500,
            message
        });
    }
}
