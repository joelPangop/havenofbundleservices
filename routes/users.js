const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const validatorCredentials = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";

require('../models/User');
const User = mongoose.model('User');

const cors = require('cors')

router.use(cors({
  allowedOrigins: [
    '*'
  ]
}));

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/users', async function (req, res, cb) {
  const users = await MailingInfos.find({type: undefined});
  // res.status(200).json(articles);
  console.log('users', users);
  res.status(200).json({users: users});
});

router.post('/login', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  let val = validatorCredentials.isEmail(email);
  let promise = User.findOne({email: email});
  if (val) {
    promise.then(function (doc) {
      if (doc) {
        if (bcrypt.compareSync(password, doc.password)) {
          let token = jwt.sign({email: doc.email}, SECRET_KEY, {expiresIn: '3h'});
          res.status(200).json({user: doc, access_token: token, status: 'success'});
        } else {
          return res.status(401).json({message: 'Invalid credentials!'});
        }
      } else {
        return res.status(401).json({message: 'Invalid email!'});
      }
    })
    promise.catch(function (err) {
      return res.status(501).json({message: 'Some internal error'});
    })
  } else {
    return res.status(401).json({message: 'Invalid email!'});
  }
})

let decodedToken = '';

function verifyToken(req, res, next) {
  let token = req.params.token;
  jwt.verify(token, SECRET_KEY, function (err, tokendata) {
    if (err) {
      return res.status(400).json({message: 'Unauthorized request'})
    }
    if (tokendata) {
      decodedToken = tokendata;
      next();
    }
  })
}

router.get('/user/username/:token', verifyToken, async (req, res, next) => {
  res.status(200).json(decodedToken.username);
});

router.post('/register', async (req, res) => {
  const email = req.body.email;
  console.log(req.body);
  // const password = bcrypt.hashSync(req.body.password, 8);

  let val = validatorCredentials.isEmail(email);
  let promise = User.findOne({email: email});
  if (val) {
    promise.then(async function (doc) {
      if (doc) {
        return res.status(402).json({message: 'Email already exists in our database!'});
      } else {
        let user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.avatar = req.body.avatar;
        user.password = req.body.password;
        user.userInfo = req.body.userInfo;
        user.birthday = new Date(req.body.birthday);
        await user.save();
        const expiresIn = 24 * 60 * 60;
        const accessToken = jwt.sign({id: user.id}, SECRET_KEY, {
          expiresIn: expiresIn
        });
        let authResponse = {
          id: user._id,
          username: user.username,
          email: user.email,
          access_token: accessToken,
          expires_in: expiresIn
        }
        res.status(200).send({result: 'success', user: authResponse});
      }
    })
    promise.catch(function (err) {
      return res.status(501).json({message: 'Some internal error'});
    })
  } else {
    return res.status(401).json({message: 'Invalid email!'});
  }
});

module.exports = router;
