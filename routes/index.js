const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const validatorCredentials = require("validator");

require('../models/MailingInfos');
const MailingInfos = mongoose.model('MailingInfos');

require('../models/Mail');
const Mail = mongoose.model('Mail');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";
const nodemailer = require('nodemailer');

const cors = require('cors')
const whitelist = ['http://127.0.0.1:8080', 'http://127.0.0.1:8081']

// router.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers",
//         "Origin, X-Requeted-With, Content-Type, Accept, Authorization, RBR");
//     if (req.headers.origin) {
//         res.header('Access-Control-Allow-Origin', req.headers.origin);
//     }
//     // res.header("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
//     if (req.method === 'OPTIONS') {
//         res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
//         return res.status(200).json({});
//     }
//     next();
// })

router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }

require('../models/User');
const User = mongoose.model('User');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/user', async function (req, res, cb) {
    console.log('body:', req.body);
    let mailingInfos = new MailingInfos(req.body);
    mailingInfos.isSent = false;
    let val = validatorCredentials.isEmail(req.body.email);
    let promise = MailingInfos.findOne({email: req.body.email});
    if (val) {
        promise.then(function (doc) {
            if (doc) {
                return res.status(401).json({type: "ValidationExists", message: 'email already exists!'});
            } else {
                mailingInfos.save().then(() => {
                    console.log("Mailing Infos is created");
                    let mail = new Mail();
                    mail.to = req.body.email;
                    mail.from = 'admin@egoal-shopping.com';
                    mail.subject = "Registration Succeed";
                    mail.text = 'Thank you for signing up.';
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
                        html: '<!DOCTYPE html>\n' +
                            '<html lang="en">\n' +
                            '<head> <meta charset="UTF-8"/></head><body><h1>Welcome <label style="color: #ab924d">' + req.body.firstname + '</label></h1><br/><p>' + mail.text + '</p>' +
                            '</body></html>'
                    };

                    // verify connection configuration
                    transporter.verify(function (error, success) {
                        if (error) {
                            console.log(error);
                            res.status(404).json({
                                response: "Not found Error",
                                type: "ValidationNotFound",
                                status: "Failed"
                            });
                        } else {
                            transporter.sendMail(mailOptions, async function (error, info) {
                                if (error) {
                                    console.log(error);
                                    // res.status(404);
                                    res.status(200).json({
                                        response: "Mailing Infos is created",
                                        mailingInfos: mailingInfos,
                                        status: "success"
                                    });
                                } else {
                                    console.log('Email sent: ' + info.response);
                                    mailingInfos.isSent = true;
                                    await mail.save();
                                    await mailingInfos.save().then(() => {
                                        res.status(200).json({
                                            response: "Mailing Infos is created",
                                            mailingInfos: mailingInfos,
                                            status: "success"
                                        });
                                    }).catch((e) => {
                                        console.log('error', e)
                                        res.status(503).json({
                                            response: "Internal Error",
                                            type: "InternalError",
                                            status: "Failed"
                                        });
                                    });

                                    // res.status(200).json({message: info.response});
                                }
                            });
                            console.log("MAILER CONNECTION VERIFIED");
                        }
                    });

                }).catch((err) => {
                    if (err) {
                        throw err;
                    }
                });
            }
        })
    } else {
        return res.status(401).json({type: "ValidationError", message: 'Invalid email!'});
    }
});

router.get('/users', async function (req, res, cb) {
    const users = await MailingInfos.find({type: undefined});
    // res.status(200).json(articles);
    console.log('users', users);
    res.status(200).json({users: users});
});

router.post('/login', function (req, res, next) {
    const email = req.body.user.email;
    const password = req.body.user.password;
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

router.post('/mail', cors(), function (req, res, next) {
    const mail = new Mail();
    mail.to = req.body.email;
    mail.from = 'admin@egoal-shopping.com';
    mail.subject = "Registration Succeed";
    mail.text = 'Thank you for signing up.';
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
        html: '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head> <meta charset="UTF-8"/></head><body><h1>Welcome <label style="color: #ab924d">' + req.body.firstname + '</label></h1><br/><p>' + mail.text + '</p>' +
            '</body></html>'
    };

    transporter.sendMail(mailOptions, async function (error, info) {

        if (error) {
            console.log(error);
            res.status(404).json({message: info.response, status: 'failed'});
        } else {
            let mailingInfos = MailingInfos.findOne({email: req.body.email});
            console.log('Email sent: ' + info.response);
            await mail.save();
            let val = validatorCredentials.isEmail(req.body.email);
            let promise = MailingInfos.findOne({email: req.body.email});
            if (val) {
                promise.then(function (doc) {
                    if (doc) {
                        console.log(doc);
                        doc.isSent = true;
                        doc.save().then((user) => {
                            res.status(200).json({message: info.response, user: user, status: 'success'});
                        });
                    }
                })
            }
            // mailingInfos.isSent = true;
        }
    });

});


module.exports = router;
