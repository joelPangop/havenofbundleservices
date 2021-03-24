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

require('../models/Mail');
const Mail = mongoose.model('Mail');

const GridFsStorage = require('multer-gridfs-storage');

const db_url = require('../models/db_url')

const multer = require("multer");
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors')

let profile = '';

router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/user/:id', async function (req, res, cb) {
    const id = req.params.id;
    let user = await User.findOne({"_id": id});
    user.password = "";
    // res.status(200).json(articles);
    console.log('users', user);
    res.status(200).send( user);
});

router.get('/user', async function (req, res, cb) {
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
    userService.authenticate({email, password, ipAddress})
        .then(({jwtToken, refreshToken, ...user}) => {
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
                user.password = bcrypt.hashSync(req.body.password, 8);
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

router.put('/update/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    let promise = User.findOne({_id: id});

    promise.then(async function (doc) {
        if (doc) {
            let user = new User(doc);
            user.username = req.body.username;
            user.email = req.body.email;
            user.avatar = req.body.avatar;
            user.userInfo = req.body.userInfo;
            user.shipping_addr = req.body.shipping_addr;
            user.birthday = new Date(req.body.birthday);
            await user.save();
            res.status(200).send({result: 'success', user: user});

        } else {
            return res.status(402).json({message: 'User not found'});
        }
    })
    promise.catch(function (err) {
        return res.status(501).json({result: 'failed', message: 'Some internal error'});
    })
})

router.put('/update/password/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    let promise = User.findOne({_id: id});
    promise.then(async function (doc) {
        if (doc) {
            let user = new User(doc);
            user.userInfo = req.body.userInfo;
            user.password = bcrypt.hashSync(req.body.password, 8);
            await user.save();
            user.password = '';
            res.status(200).send({result: 'success', user: user});
        } else {
            return res.status(402).json({message: 'User not found'});
        }
    })
    promise.catch(function (err) {
        return res.status(501).json({result: 'failed', message: 'Some internal error'});
    })
});

router.put('/update/image/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    let promise = User.findOne({_id: id});
    promise.then(async function (doc) {
        if (doc) {
            let user = new User(doc);
            user.avatar = req.body.avatar;
            await user.save();
            res.status(200).send({result: 'success', user: user});
        } else {
            return res.status(402).json({message: 'User not found'});
        }
    })
    promise.catch(function (err) {
        return res.status(501).json({result: 'failed', message: 'Some internal error'});
    })
});

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({token}).populate('user');
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(user) {
    // create a jwt token containing the user id that expires in 15 minutes
    return jwt.sign({sub: user.id, id: user.id}, config.secret, {expiresIn: '15m'});
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        user: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

function setTokenCookie(res, token) {
    // create http only cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}


// Create storage engine
const storage = new GridFsStorage({
    url: db_url.url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
                profile = filename;
                console.log('file', filename);
            });
        });
    }
});

const upload = multer({storage});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/uploadImgProfile', upload.single("file"), (req, res) => {
    res.json({"filename":profile});
});

router.post('/mail', async function (req, res, next) {
    let mail = new Mail();
    mail.to = req.body.to;
    mail.from = 'admin@egoal-shopping.com';
    mail.subject = req.body.subject;
    mail.text = req.body.text;
    console.log('mail', mail);

    const transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: 'mail.privateemail.com',
        secure: true,
        port: 465,
        auth: {
            user: 'admin@egoal-shopping.com',
            pass: 'Jojo0689'
        }
    });

    const mailOptions = {
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.status(404);
        } else {
            console.log('Email sent: ' + info.response);
            mail.save();
            res.status(200).json(info.response);
        }
    });
});

router.put('/update_verification', async (req, res) => {
    const user = new User(req.body);
    const usr = await User.findOne({"_id": user.id});
    if (usr) {
        try {
            usr.verified = user.verified;
            return new Promise(async function (resolve, reject) {
                console.log(resolve);
                usr.save(function (err, user) {
                    if (err) return console.error(err);
                });

                res.status(200).send({statusCode: "success", user: usr});
            });
        } catch (error) {
            return res.send({status: 1, statusCode: "error", message: error.message});
        }
    }
});

module.exports = router;
