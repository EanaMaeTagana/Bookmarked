const isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') {
      return next(); 
    } else {
      res.status(403).json({ message: "Access Denied: You are not an Admin!" });
    }
  } else {
    res.status(401).json({ message: "Please log in first." });
  }
};

module.exports = isAdmin;