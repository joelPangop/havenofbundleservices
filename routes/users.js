const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const validatorCredentials = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";

const userService = require('../services/userservices');

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
  const ipAddress = req.ip;
  userService.authenticate({ email, password, ipAddress })
      .then(({ jwtToken, refreshToken, ...user }) => {
        setTokenCookie(res, refreshToken);
        res.json({user, refreshToken: refreshToken, accessToken: jwtToken});
      })
      .catch(next);
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

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate('user');
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(user) {
  // create a jwt token containing the user id that expires in 15 minutes
  return jwt.sign({ sub: user.id, id: user.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(user, ipAddress) {
  // create a refresh token that expires in 7 days
  return new db.RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7*24*60*60*1000),
    createdByIp: ipAddress
  });
}

function setTokenCookie(res, token)
{
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7*24*60*60*1000)
  };
  res.cookie('refreshToken', token, cookieOptions);
}

module.exports = router;
