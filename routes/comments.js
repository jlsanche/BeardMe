const express = require("express");
const router  = express.Router({mergeParams: true});
const Beard = require("../models/beard");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find post by id
    console.log(req.params.id);
    Beard.findById(req.params.id, function(err, beard){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {beard: beard});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, function(req, res){
   //lookup beard post using ID
   Beard.findById(req.params.id, function(err, beard){
       if(err){
           console.log(err);
           res.redirect("/beards");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               //add username and id to comment
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               beard.comments.push(comment);
               beard.save();
               console.log(comment);
               req.flash('success', 'Created a comment!');
               res.redirect('/beards/' + beard._id);
           }
        });
       }
   });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, function(req, res){
  res.render("comments/edit", {beard_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isAdmin, function(req, res){
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/beards/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId", isLoggedIn, checkUserComment, function(req, res){
  // find post, remove comment from comments array, delete comment in db
 Beard .findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function(err) {
    if(err){ 
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.comment.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Comment deleted!');
          res.redirect("/beards/" + req.params.id);
        });
    }
  });
});

module.exports = router;