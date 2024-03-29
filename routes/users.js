const mongoose = require("mongoose");

const plm  = require("passport-local-mongoose");

mongoose.connect("mongodb+srv://Sarthak6596:Micro%401909@demeg.ffhvfqq.mongodb.net/?retryWrites=true&w=majority&appName=Demeg");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  dp: {
    type: String, 
  },
  email: {
    type: String
  },
  fullname: {
    type: String,
  },
});

userSchema.plugin(plm);

const User = mongoose.model('User', userSchema);

module.exports = User;
