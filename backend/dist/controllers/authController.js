"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleDistrictAdmin = exports.deleteDistrictAdmin = exports.updateDistrictAdmin = exports.createDistrictAdmin = exports.listDistrictAdmins = exports.getAllUsers = exports.getProfile = exports.login = exports.toggleUserStatus = exports.deleteUser = exports.updateUser = exports.createUser = void 0;
const user_1 = require("../models/user");
const jwtUtils_1 = require("../utils/jwtUtils");
const errors_1 = require("../types/errors");
const createUser = async (req, res, next) => {
    try {
        const { email, password, name, role, state, district } = req.body;
        // Check if user exists
        const existingUser = await user_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email already exists');
        }
        // Create user (Mongoose handles hashing in pre-save hook)
        const user = await user_1.User.create({
            email: email.toLowerCase(),
            password,
            name,
            role,
            state,
            district,
            isActive: true
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user.toJSON()
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        // Don't allow password update through this endpoint
        delete updates.password;
        const user = await user_1.User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update user'
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Prevent deleting own account
        if (userId === req.user?.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        const user = await user_1.User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete user'
        });
    }
};
exports.deleteUser = deleteUser;
const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await user_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to toggle user status'
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// export const register = async (req: Request, res: Response) => {
//   try {
//     const { email, password, name, role, state, district } = req.body;
//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }
//     // Create user
//     const user = await User.create({
//       email,
//       password,
//       name,
//       role,
//       state,
//       district
//     });
//     // Generate token
//     const token = generateToken({
//       userId: (user._id as any).toString(),
//       email: user.email,
//       role: user.role,
//       name: user.name
//     });
//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       data: {
//         user: user.toJSON(),
//         token
//       }
//     });
//   } catch (error: any) {
//     console.error('Register error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Registration failed'
//     });
//   }
// };
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await user_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Check if active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is inactive'
            });
        }
        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate token
        const token = (0, jwtUtils_1.generateToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
            state: user.state, // << add this line
            district: user.district
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: user.toJSON(),
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Login failed'
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await user_1.User.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch profile'
        });
    }
};
exports.getProfile = getProfile;
const getAllUsers = async (req, res) => {
    try {
        const users = await user_1.User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users'
        });
    }
};
exports.getAllUsers = getAllUsers;
// List district admins for this state (state_admin & super_admin)
const listDistrictAdmins = async (req, res) => {
    try {
        const query = { role: 'districtAdmin' };
        // stateAdmin can see only within their state
        if (req.user?.role === 'stateAdmin' && req.user.state) {
            query.state = req.user.state;
        }
        const users = await user_1.User.find(query).select('-password');
        res.status(200).json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
    }
};
exports.listDistrictAdmins = listDistrictAdmins;
// Add district admin (by state_admin or super_admin)
const createDistrictAdmin = async (req, res) => {
    try {
        const { name, email, password, district } = req.body;
        if (!name || !email || !password || !district) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const existing = await user_1.User.findOne({ email });
        if (existing)
            return res.status(400).json({ success: false, message: 'Email exists' });
        const adminState = req.user?.role === 'superAdmin' ? req.body.state : req.user?.state;
        if (!adminState) {
            console.log('DEBUG req.user:', req.user); // Add this log for debugging!
            return res.status(422).json({ success: false, message: 'State is required' });
        }
        const user = await user_1.User.create({
            name, email, password,
            role: 'districtAdmin',
            state: adminState,
            district,
            isActive: true
        });
        res.status(201).json({ success: true, message: 'District admin created', data: user.toJSON() });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create admin' });
    }
};
exports.createDistrictAdmin = createDistrictAdmin;
// Edit district admin (only for own state by state_admin)
const updateDistrictAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        // Fetch and check ownership
        const admin = await user_1.User.findById(userId);
        if (!admin || admin.role !== 'districtAdmin') {
            return res.status(404).json({ success: false, message: 'District admin not found' });
        }
        if (req.user?.role === 'stateAdmin' && admin.state !== req.user?.state) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        // Only allow certain fields to be updated
        const allowedFields = ['name', 'email', 'district', 'isActive'];
        // use `any` for dynamic indexing on the mongoose document and incoming updates
        allowedFields.forEach((f) => {
            admin[f] = updates[f] ?? admin[f];
        });
        await admin.save();
        res.status(200).json({ success: true, message: 'Updated', data: admin.toJSON() });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update admin' });
    }
};
exports.updateDistrictAdmin = updateDistrictAdmin;
// Delete district admin (state_admin can only in own state)
const deleteDistrictAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const admin = await user_1.User.findById(userId);
        if (!admin || admin.role !== 'districtAdmin') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (req.user?.role === 'stateAdmin' && admin.state !== req.user?.state) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        await admin.deleteOne();
        res.status(200).json({ success: true, message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to delete admin' });
    }
};
exports.deleteDistrictAdmin = deleteDistrictAdmin;
// Toggle active status
const toggleDistrictAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const admin = await user_1.User.findById(userId);
        if (!admin || admin.role !== 'districtAdmin') {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (req.user?.role === 'stateAdmin' && admin.state !== req.user?.state) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        admin.isActive = !admin.isActive;
        await admin.save();
        res.status(200).json({ success: true, message: 'Status toggled', data: { isActive: admin.isActive } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
    }
};
exports.toggleDistrictAdmin = toggleDistrictAdmin;
