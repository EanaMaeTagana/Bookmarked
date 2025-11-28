// bookmarked/server/middleware/isAdmin.js

const isAdmin = (req, res, next) => {
  // 1. Check if user is logged in
  if (req.isAuthenticated()) {
    // 2. Check if the role is 'admin'
    if (req.user.role === 'admin') {
      return next(); // Allowed! Proceed to the next step.
    } else {
      res.status(403).json({ message: "Access Denied: You are not an Admin!" });
    }
  } else {
    res.status(401).json({ message: "Please log in first." });
  }
};

module.exports = isAdmin;