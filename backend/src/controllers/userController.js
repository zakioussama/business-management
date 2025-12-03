/**
 * Example of a protected controller for admins only.
 * GET /api/users/admin-only
 */
export const getAdminData = (req, res) => {
  res.status(200).json({
    message: 'Welcome, Admin! This is protected data.',
    user: req.user, // The user object is attached by the 'protect' middleware
  });
};
