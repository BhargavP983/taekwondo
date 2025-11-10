"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStateAdminActivities = exports.getStateAdminStats = exports.getRecentActivities = void 0;
const user_1 = require("../models/user");
const cadet_1 = require("../models/cadet");
const poomsae_1 = require("../models/poomsae");
{
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
                { $match: query },
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
                    $sort: { role: 1 }
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
;
{
    $group: {
        _id: "$role", count;
        {
            $sum: 1;
        }
    }
}
;
const usersByRole = roleStats.map(({ _id, count }) => ({
    role: _id,
    count
}));
const stats = {
    totalUsers,
    totalCadets,
    totalPoomsae,
    activeUsers,
    recentCadets,
    recentPoomsae,
    usersByRole
};
res.status(200).json({
    success: true,
    data: stats
});
try { }
catch (error) {
    res.status(500).json({
        success: false,
        status: 500,
        message: error.message || 'Failed to fetch dashboard statistics'
    });
}
;
{
    $group: {
        _id: '$role', count;
        {
            $sum: 1;
        }
    }
}
;
// Get cadet breakdown by state
const cadetsByState = await cadet_1.Cadet.aggregate([
    { $group: { _id: '$state', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
]);
// Get cadet breakdown by gender
const cadetsByGender = await cadet_1.Cadet.aggregate([
    { $group: { _id: '$gender', count: { $sum: 1 } } }
]);
// Get poomsae breakdown by division
const poomsaeByDivision = await poomsae_1.Poomsae.aggregate([
    { $group: { _id: '$division', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]);
// Get recent registrations
const recentRegistrations = await cadet_1.Cadet.find()
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
try { }
catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics'
    });
}
;
const getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // Get recent cadet registrations
        const recentCadets = await cadet_1.Cadet.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('entryId name state createdAt')
            .lean();
        // Get recent poomsae registrations
        const recentPoomsae = await poomsae_1.Poomsae.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('entryId name stateOrg createdAt')
            .lean();
        // Get recent user registrations
        const recentUsers = await user_1.User.find()
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch activities'
        });
    }
};
exports.getRecentActivities = getRecentActivities;
//state-admin controller
const getStateAdminStats = async (req, res) => {
    try {
        const userState = req.user?.state; // Get state from authenticated user
        if (!userState) {
            return res.status(400).json({
                success: false,
                message: 'State information not found for this admin'
            });
        }
        // Get total counts for this state
        const totalCadets = await cadet_1.Cadet.countDocuments({ state: userState });
        const totalPoomsae = await poomsae_1.Poomsae.countDocuments({ stateOrg: userState });
        // Get recent applications (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCadets = await cadet_1.Cadet.countDocuments({
            state: userState,
            createdAt: { $gte: sevenDaysAgo }
        });
        const recentPoomsae = await poomsae_1.Poomsae.countDocuments({
            stateOrg: userState,
            createdAt: { $gte: sevenDaysAgo }
        });
        // Get cadet breakdown by gender in this state
        const cadetsByGender = await cadet_1.Cadet.aggregate([
            { $match: { state: userState } },
            { $group: { _id: '$gender', count: { $sum: 1 } } }
        ]);
        // Get cadet breakdown by district in this state
        const cadetsByDistrict = await cadet_1.Cadet.aggregate([
            { $match: { state: userState } },
            { $group: { _id: '$district', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        // Get poomsae breakdown by division in this state
        const poomsaeByDivision = await poomsae_1.Poomsae.aggregate([
            { $match: { stateOrg: userState } },
            { $group: { _id: '$division', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        // Get poomsae breakdown by category
        const poomsaeByCategory = await poomsae_1.Poomsae.aggregate([
            { $match: { stateOrg: userState } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        // Get recent registrations for this state
        const recentRegistrations = await cadet_1.Cadet.find({ state: userState })
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
    }
    catch (error) {
        console.error('State admin stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch state statistics'
        });
    }
};
exports.getStateAdminStats = getStateAdminStats;
const getStateAdminActivities = async (req, res) => {
    try {
        const userState = req.user?.state;
        const limit = parseInt(req.query.limit) || 10;
        if (!userState) {
            return res.status(400).json({
                success: false,
                message: 'State information not found'
            });
        }
        // Get recent cadet registrations in this state
        const recentCadets = await cadet_1.Cadet.find({ state: userState })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('entryId name state createdAt')
            .lean();
        // Get recent poomsae registrations in this state
        const recentPoomsae = await poomsae_1.Poomsae.find({ stateOrg: userState })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch activities'
        });
    }
};
exports.getStateAdminActivities = getStateAdminActivities;
