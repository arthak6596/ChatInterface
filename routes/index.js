var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload = require("./multer");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login',{error : req.flash('error')});
});

router.post('/upload',isLoggedIn,upload.single("file"),async function(req, res, next) {
  if(!req.file){
    return res.status(400).send("No Files were Uploaded");
  }
  const user = await userModel.findOne({username : req.session.passport.user.username})
  // console.log(user);
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});
router.post('/search',async function(req,res){
  const data = req.body.value;
 const posts = await postModel.find({imageText : {$regex: `^${data}`, $options: 'i' } }).populate("user")
 const users = await userModel.find({username : {$regex: `^${data}`, $options: 'i' } })
  res.render("search",{posts,users,data})
})
router.get('/delete/:postId',isLoggedIn, async function(req,res,next){
  const postId = req.params.postId;
 
  const postdel = await postModel.findByIdAndDelete(postId);
  const user = await userModel.findOne({
    username: req.session.passport.user.username
  }).populate("posts")
  res.redirect("/profile");
})

router.get('/profile/:userId',async function(req,res,next){
  const userId = req.params.userId;
  const user = await userModel.findById(userId).populate("posts");
  console.log(user);
  res.render('profile', { user });
})

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const posts =  await postModel.find().populate("user");
  console.log(posts);
  res.render('feed', {posts} );
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
   const user = await userModel.findOne({
    username: req.session.passport.user.username
  }).populate("posts");
  res.render('profile', {user}); 
  
});

router.post('/register', async function(req,res){
  const { username,email,fullname } = req.body;
  const userData = new userModel({username,email,fullname});
  await userModel.register(userData, req.body.password).then(function (){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile")
    })
  })
})

router.post('/login',passport.authenticate("local",{
  successRedirect: "/feed",
  failureRedirect: "/login",
  failureFlash:true

}) ,function(req,res){
 
})

router.get('/logout',function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})
router.get("/test",function(req,res){
  res.send("test");
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

// router.get('/createUser', async function(req, res, next) {
//   let createdUser = await userModel.create({
//     username: "sarthaksfs",
//     password: "sarthaaask",
//     posts: [],
//     email: "sarthfafaak@gmail.com",
//     fullName: "sartfsafsahak chaudhary",
//   })
//   res.send(createdUser);
// });

// router.get('/allUserPosts', async function(req, res, next) {
//     let user  = await userModel.findOne({_id:"6575966c832d6ec813c9cf92"}).populate('posts')
//     res.send(user)
// });

// router.get('/createPost', async function(req, res, next) {
//   let createdPost = await postModel.create({
//     postText: "hello there",
//     user:"6575966c832d6ec813c9cf92"
//   })
//   let user = await userModel.findOne({_id:"6575966c832d6ec813c9cf92"})
//   user.posts.push(createdPost._id)
//   await user.save();

//   res.send("done");
// });

module.exports = router;
