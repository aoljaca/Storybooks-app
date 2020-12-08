const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "story-books-app-andrej.herokuapp.com/auth/google/callback"
    },
    async(accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.firstName,
            lastName: profile.lastName,
            image: profile.photos[0].value
        }
        let user = await User.findOne({googleId: profile.id}) 
        if (!user) {
            user = await User.create(newUser)
            done(null, user)
        } else {
            done(null, user)
        }
      }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}
