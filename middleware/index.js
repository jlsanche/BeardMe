var Comment = require('../models/comment');
var Beard= require('../models/beard');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserBeard: function(req, res, next){
    Beard.findById(req.params.id, function(err, foundBeard){
      if(err || !foundBeard){
          console.log(err);
          req.flash('error', 'Sorry, that post does not exist!');
          res.redirect('/beards');
      } else if(foundBeard.author.id.equals(req.user._id) || req.user.isAdmin){
          req.beard = foundBeard;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/beards/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/beards');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/beards/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  },
  
}