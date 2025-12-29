const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/Users'); // Ensure this path is correct

// 1. SERIALIZE: Decide what to store in the session cookie
passport.serializeUser((user, done) => {
  if (user.isNew) {
    // If it's a "Temp" user (not in DB yet), store the whole object
    done(null, user);
  } else {
    // If it's a real user, just store the ID (Standard practice)
    done(null, user.id);
  }
});

// 2. DESERIALIZE: Recover user from the session cookie
passport.deserializeUser(async (idOrObj, done) => {
  // Check if it's our "Temp" user object
  if (idOrObj.isNew) {
    done(null, idOrObj);
  } else {
    // It's a real ID, look it up in the database
    try {
      const user = await User.findById(idOrObj);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
});

// 3. THE STRATEGY
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in MongoDB
      const existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        // CASE A: User Found -> Log them in
        return done(null, existingUser);
      } else {
        // CASE B: User NOT Found (New or Deleted)
        // ⚠️ CHANGE: We do NOT create the user here anymore.
        // We pass a temp object so the router knows to redirect them.
        const tempUser = {
          isNew: true,
          googleId: profile.id,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        };
        return done(null, tempUser);
      }
    } catch (err) {
      console.error(err);
      return done(err, null);
    }
  }
));

module.exports = passport;