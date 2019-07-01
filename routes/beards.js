var express = require("express");
var router = express.Router();
var Beard = require("../models/beard");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var cloudinary = require("cloudinary");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function(req, file, cb) {
  //check valid image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic|heif)$/i)) {
    return cb(new Error("Please upload image file type only"), false);
  }
  cb(null, true);
};

var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

cloudinary.config({
  cloud_name: "dbjg582h5",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var { isLoggedIn, checkUserBeard, checkUserComment, isAdmin } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//INDEX - show all beard posts
router.get("/", function(req, res) {
  if (req.query.search && req.xhr) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all posts from DB
    Beard.find(
      {
        name: regex
      },
      function(err, allBeards) {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json(allBeards);
        }
      }
    );
  } else {
    // Get all posts from DB
    Beard.find({}, function(err, allBeards) {
      if (err) {
        console.log(err);
      } else {
        if (req.xhr) {
          res.json(allBeards);
        } else {
          res.render("beards/index", {
            beards: allBeards,
            page: "beards"
          });
        }
      }
    });
  }
});

//CREATE - add new beard to DB
router.post("/", isLoggedIn, upload.single("image"), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(result) {
    req.body.beard.image = result.secure_url;

    req.body.beard.author = {
      id: req.user._id,
      username: req.user.username
    };

    Beard.create(req.body.beard, function(err, beard) {
      if (err) {
        console.log(err);
        req.flash("error", err.message);
        return res.redirect("back");
      }

      //redirect back to beard page

      res.redirect("/beards/" + beard.id);
    });
  });
});

//NEW - show form to create new beard
router.get("/new", isLoggedIn, function(req, res) {
  res.render("beards/new");
});

// SHOW - shows more info about one beard
router.get("/:id", function(req, res) {
  //find beard with provided ID
  Beard.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundBeard) {
      if (err || !foundBeard) {
        console.log(err);
        req.flash("error", "Sorry, that post does not exist!");
        return res.redirect("/beards");
      }
      console.log(foundBeard);
      //render show template with that post
      res.render("beards/show", {
        beard: foundBeard
      });
    });
});

// EDIT - shows edit form for a beard
router.get("/:id/edit", isLoggedIn, checkUserBeard, function(req, res) {
  //render edit template with that beard
  res.render("beards/edit", {
    beard: req.beard
  });
});

// PUT - updates beardin the database
router.put("/:id", function(req, res) {
  var newData = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.desc
  };

  Beard.findByIdAndUpdate(
    req.params.id,
    {
      $set: newData
    },
    function(err, beard) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/beards/" + beard._id);
      }
    }
  );
});

// DELETE - removes beardsand its comments from the database
router.delete("/:id", isLoggedIn, checkUserBeard, function(req, res) {
  Comment.remove(
    {
      _id: {
        $in: req.beard.comments
      }
    },
    function(err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/");
      } else {
        req.beard.remove(function(err) {
          if (err) {
            req.flash("error", err.message);
            return res.redirect("/");
          }
          req.flash("error", "Beard deleted!");
          res.redirect("/beards");
        });
      }
    }
  );
});

module.exports = router;
