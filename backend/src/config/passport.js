    // backend/src/config/passport.js
    const JwtStrategy = require('passport-jwt').Strategy;
    const ExtractJwt = require('passport-jwt').ExtractJwt;
    const User = require('../models/User'); // Path to your User model
    require('dotenv').config(); // Load environment variables

    /**
     * @desc Configures Passport.js with a JWT strategy for authentication.
     * @param {Object} passport - The Passport.js instance.
     */
    const configurePassport = (passport) => {
      const opts = {};
      // Extract JWT from the Authorization header as a Bearer token
      opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
      // Secret key for verifying the token (should be the same as used for signing)
      opts.secretOrKey = process.env.JWT_SECRET;

      passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
          try {
            // Find the user by ID extracted from the JWT payload
            const user = await User.findById(jwt_payload.id);

            if (user) {
              // If user found, pass the user object to the next middleware
              return done(null, user);
            } else {
              // If user not found, authentication failed
              return done(null, false);
            }
          } catch (err) {
            // Handle any errors during database lookup
            console.error('Error during JWT authentication:', err);
            return done(err, false);
          }
        })
      );
    };

    module.exports = configurePassport;
    