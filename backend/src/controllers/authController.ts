import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import { generateToken } from '../utils/jwtUtils';
import { AuthRequest } from '../middleware/authMiddleware';
import { ConflictError, NotFoundError } from '../types/errors';
import { UserData, ApiResponse, FilterQuery } from '../types/api';

export const createUser = async (req: AuthRequest, res: Response<ApiResponse<UserData>>, next: NextFunction) => {
  try {
    const { email, password, name, role, state, district } = req.body as UserData;
    
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user (Mongoose handles hashing in pre-save hook)
    const user = await User.create({
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
      data: user.toJSON() as UserData
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password update through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user'
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own account
    if (userId === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to toggle user status'
    });
  }
};

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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
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
    const token = generateToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      state: user.state,        // << add this line
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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch profile'
    });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users'
    });
  }
};

// List district admins for this state (state_admin & super_admin)
export const listDistrictAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const query: { role: string; state?: string } = { role: 'districtAdmin' };
    // stateAdmin can see only within their state
    if (req.user?.role === 'stateAdmin' && req.user.state) {
      query.state = req.user.state;
    }

    const users = await User.find(query).select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
};

// Add district admin (by state_admin or super_admin)
export const createDistrictAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, district } = req.body;
    if (!name || !email || !password || !district) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email exists' });

    const adminState = (req.user as any)?.role === 'superAdmin' ? req.body.state : (req.user as any)?.state;
    if (!adminState) {
      console.log('DEBUG req.user:', req.user);  // Add this log for debugging!
      return res.status(422).json({ success: false, message: 'State is required' });
    }
    const user = await User.create({
      name, email, password,
      role: 'districtAdmin',
      state: adminState,
      district,
      isActive: true
    });

    res.status(201).json({ success: true, message: 'District admin created', data: user.toJSON() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create admin' });
  }
};

// Edit district admin (only for own state by state_admin)
export const updateDistrictAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Fetch and check ownership
    const admin = await User.findById(userId);
    if (!admin || admin.role !== 'districtAdmin') {
      return res.status(404).json({ success: false, message: 'District admin not found' });
    }
    if (req.user?.role === 'stateAdmin' && admin.state !== req.user?.state) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'email', 'district', 'isActive'] as const;
    // use `any` for dynamic indexing on the mongoose document and incoming updates
    allowedFields.forEach((f) => {
      (admin as any)[f] = (updates as any)[f] ?? (admin as any)[f];
    });
    await admin.save();

    res.status(200).json({ success: true, message: 'Updated', data: admin.toJSON() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update admin' });
  }
};

// Delete district admin (state_admin can only in own state)
export const deleteDistrictAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const admin = await User.findById(userId);

    if (!admin || admin.role !== 'districtAdmin') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if ((req.user as any)?.role === 'stateAdmin' && admin.state !== (req.user as any)?.state) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await admin.deleteOne();
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete admin' });
  }
};

// Toggle active status
export const toggleDistrictAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const admin = await User.findById(userId);

    if (!admin || admin.role !== 'districtAdmin') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if ((req.user as any)?.role === 'stateAdmin' && admin.state !== (req.user as any)?.state) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();
    res.status(200).json({ success: true, message: 'Status toggled', data: { isActive: admin.isActive } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

// Change password for logged-in user
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to change password'
    });
  }
};

// Admin reset password for other users (SuperAdmin for StateAdmin, StateAdmin for DistrictAdmin)
export const adminResetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    const adminUser = req.user;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Find target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Authorization checks
    if (adminUser?.role === 'superAdmin') {
      // SuperAdmin can reset password for StateAdmin and DistrictAdmin
      if (!['stateAdmin', 'districtAdmin'].includes(targetUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only reset passwords for State Admins and District Admins'
        });
      }
    } else if (adminUser?.role === 'stateAdmin') {
      // StateAdmin can only reset password for DistrictAdmin in their state
      if (targetUser.role !== 'districtAdmin') {
        return res.status(403).json({
          success: false,
          message: 'You can only reset passwords for District Admins'
        });
      }
      if (targetUser.state !== adminUser.state) {
        return res.status(403).json({
          success: false,
          message: 'You can only reset passwords for District Admins in your state'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reset passwords'
      });
    }

    // Update password (will be hashed by pre-save hook)
    targetUser.password = newPassword;
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${targetUser.name}`
    });
  } catch (error: any) {
    console.error('Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};
