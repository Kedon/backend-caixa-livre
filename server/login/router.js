'use strict'
const controller = require('./controller');
const router = require('express').Router();

const userService = require('../users/service')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;

const uploadService = require('../uploads/service')
/**
 * Shipper app
 * profile aldenirsrv@gmail.com
 */

var FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
var FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  
  
  


  // Use the FacebookStrategy within Passport.
  //   Strategies in Passport require a `verify` function, which accept
  //   credentials (in this case, an accessToken, refreshToken, and Facebook
  //   profile), and invoke a callback with a user object.
  passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      enableProof: true,
      callbackURL: "http://ec2-18-234-143-228.compute-1.amazonaws.com:3002/api/login/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'name', 'gender', 'profileUrl', 'emails', 'picture.type(large)']
    },
     function(accessToken, refreshToken, profile, next) {
      // asynchronous verification, for effect...
      process.nextTick(async () =>{
        const {id, name, last_name, first_name, email, picture} = JSON.parse(profile._raw)
        let finduser  = null;
        let userImage = null;
        let user =  {
            firstName: first_name,
            lastName: last_name,
            displayName: name,
            email: email,
            socialID: id,
            socialMedia: 'FACEBOOK',
        }
        finduser  = await userService.listUserEmail(email)
        /**
         * If user not exists create it
         */
         if(!finduser || finduser === null) {
             /** CREATE NEW USER  */
             await userService.createUser(user.firstName,user.lastName,user.email,null,null,null,user.socialID,user.displayName,user.socialMedia)
            
             /** BEFORE CREATE FIND THE NEW USER  */
             finduser  = await userService.listUserEmail(email);
            
             /** UPLOAD PROFILE PHOTO TO S3*/
             let upload = await uploadService.uploadUrl(picture.data.url, 'shipper-images/', profile.id);

             /** SAVE IMAGE IN DATABASE */
             userImage = await userService.saveUserImage(finduser.userId, upload.Location, user.displayName)
         }
        // To keep the example simple, the user's Facebook profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Facebook account with a user record in your database,
        // and return that user instead.
        return next(null, finduser);
      });
    
    // next(null,{...profile, refresh: refreshToken});
    }
  ));
  
  


/**
 * JWT login
 */
router.post('/', controller.doLogin);

  // GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
// router.get('/auth/facebook', passport.authenticate('facebook',{
//     authType: 'rerequest',
//     session: false,
//     scope: ['user_friends', 'email', 'public_profile'],
//     }));

router.get('/auth/facebook',  function(req, res, next) {
  passport.authenticate('facebook', function(err, user, info) {
      if (err) {
      return next(err); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (! user) {
      return res.send({ success : false, message : 'authentication failed' });
  }
  return res.send({ success : true, message : 'authentication succeeded' });
  })(req, res, next);
})
router.get('/passwordRecover', controller.passwordRecover)
router.get('/sendMail', controller.sendMail)
// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.


router.get('/auth/facebook/callback',passport.authenticate('facebook', {failureRedirect: '/login'}), controller.facebookLogin);


module.exports = router;