const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const {createStore} = require('redux');

const intialState="";
const reducer = (state=intialState,action)=>{
    switch(action.type){
      case "admin":
        return "admin";
      case "user":
        return "user";
      default: 
      return state;
    }
}
const store = createStore(reducer);

store.subscribe(()=>{console.log(store.getState())})

module.exports.login = async (req, res, next) => {
  try {
    
    const { username, password, role } = req.body;
    let user="";
    if(role==="admin"){
      store.dispatch({type:"admin"}); // saving the state in global store
      user = await Admin.findOne({ username });
      if (!user)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      delete user.password;
    }
    else{
      store.dispatch({type:"user"});
        user = await User.findOne({ username });
        if (!user)
          return res.json({ msg: "Incorrect Username or Password", status: false });
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
          return res.json({ msg: "Incorrect Username or Password", status: false });
        delete user.password;
    }
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    let user;
    if(role==="admin"){
      store.dispatch({type:"admin"});
      const usernameCheck = await Admin.findOne({ username });
      if (usernameCheck)
        return res.json({ msg: "Username already used", status: false });
      const emailCheck = await Admin.findOne({ email });
      if (emailCheck)
        return res.json({ msg: "Email already used", status: false });
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await Admin.create({
        email,
        username,
        password: hashedPassword,
        role,
      });
      delete user.password;
    }
    else{
      // it means user
      store.dispatch({type:"user"});
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck)
        return res.json({ msg: "Username already used", status: false });
      const emailCheck = await User.findOne({ email });
      if (emailCheck)
        return res.json({ msg: "Email already used", status: false });
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        username,
        password: hashedPassword,
        role,
      });
      delete user.password;
    }
    
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
      
      let users;
      const role = store.getState(); // extracting from global store

      if(role==="admin")
      {
        // if it is admin then show all the users and their complaints in contacts
        users = await User.find().select([
          "email",
          "username",
          "avatarImage",
          "_id",
        ]);
      }
      else{
        // if it is user then show all the admins in contact list
        users = await Admin.find().select([
          "email",
          "username",
          "avatarImage",
          "_id",
        ]);

      }
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    let userData;

    const role = store.getState();

    if(role==="admin"){
      userData = await Admin.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
    }
    else{
      userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
    }

    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
