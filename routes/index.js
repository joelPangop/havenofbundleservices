const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')
const validatorCredentials = require("validator");

require('../models/MailingInfos');
const MailingInfos = mongoose.model('MailingInfos');

require('../models/Mail');
const Mail = mongoose.model('Mail');

require('../models/Product')
const Product = mongoose.model('Product');

require('../models/BundleSet')
const BundleSet = mongoose.model('BundleSet');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET_KEY = "secretkey23456";
const nodemailer = require('nodemailer');

const cors = require('cors')

router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

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

router.post('/mail', cors(), function (req, res, next) {
    const mail = new Mail();
    mail.to = req.body.email;
    mail.from = 'admin@egoal-shopping.com';
    mail.subject = req.body.subject;
    // mail.subject = "Registration Succeed";
    mail.text = req.body.text;
    // mail.text = 'Thank you for signing up.';
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
        // html: '<!DOCTYPE html>\n' +
        //     '<html lang="en">\n' +
        //     '<head> <meta charset="UTF-8"/></head><body><h1>Welcome <label style="color: #ab924d">' + req.body.firstname + '</label></h1><br/><p>' + mail.text + '</p>' +
        //     '</body></html>'
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

router.post('/product', async function (req, res, cb) {
    const product = new Product();
    product.name = req.body.name;
    product.rate = req.body.rate;
    product.category = req.body.category;
    product.bundle_category = req.body.bundle_category;
    product.clos_front_category = req.body.clos_front_category;
    product.description = req.body.description;
    product.pictures = req.body.pictures;
    product.rates = req.body.rates;
    product.colors = req.body.colors;
    product.averageStar = req.body.averageStar;
    product.sizes = req.body.sizes;
    product.origin = req.body.origin;
    product.available = req.body.available;
    product.hairInfo = req.body.hairInfo;
    product.style = req.body.style;
    product.care = req.body.care;
    await product.save();

    res.status(200).send({result: 'success', res: product});
});

router.put('/product/:id', async function (req, res, cb) {
    const id = req.params.id;
    let product = await Product.findOne({_id: id});
    const prod = new Product(req.body);
    product.name = prod.name;
    product.rates = prod.rates;
    product.category = prod.category;
    product.bundle_category = prod.bundle_category;
    product.clos_front_category = prod.clos_front_category;
    product.description = prod.description;
    product.pictures = prod.pictures;
    product.rates = prod.rates;
    product.colors = prod.colors;
    product.averageStar = prod.averageStar;
    product.sizes = prod.sizes;
    product.origin = prod.origin;
    product.available = prod.available;
    product.hairInfo = prod.hairInfo;
    product.style = prod.style;
    product.care = prod.care;
    await product.save();
    res.status(200).send(product);
});

router.get('/products', async function (req, res, cb) {
    const products = await Product.find({});
    res.status(200).send(products);
})

router.get('/product/:id', async function (req, res, cb) {
    const id = req.params.id;

    let promise = Product.findOne({_id: id});

    promise.then(function (product) {
        res.status(200).send(product);
    })

    promise.catch(function (err) {
        return res.status(501).json({message: 'Some internal error'});
    })
})

router.post('/bundleset', async function (req, res, cb) {
    let bundleSet = new BundleSet();
    bundleSet.title = req.body.title;
    bundleSet.features = req.body.features;
    bundleSet.product = req.body.product;
    bundleSet.category = req.body.category;
    bundleSet.pictures = req.body.pictures;
    bundleSet.price = req.body.price;
    bundleSet.supplement = req.body.supplement;

    await bundleSet.save();

    res.status(200).send({result: 'success', res: bundleSet});
});

router.put('/bundleset/:id', async function (req, res, cb) {
    const id = req.params.id;

    let bundleSetToChange = await BundleSet.findOne({'_id': id});
    const bundleSet = new BundleSet(req.body);

    bundleSetToChange.title = bundleSet.title;
    bundleSetToChange.features = bundleSet.features;
    bundleSetToChange.product = bundleSet.product;
    bundleSetToChange.category = bundleSet.category;
    bundleSetToChange.pictures = bundleSet.pictures;
    bundleSetToChange.price = bundleSet.price;
    bundleSetToChange.supplement = bundleSet.supplement;

    await bundleSetToChange.save();

    res.status(200).send({result: 'success', res: bundleSet});
});

router.get('/bundleset', async function (req, res, cb) {
    const bundleset = await BundleSet.find({});
    res.status(200).send(bundleset);
})

router.get('/bundleset/:id', async function (req, res, cb) {
    const id = req.params.id;

    let promise = BundleSet.findOne({_id: id});

    promise.then(function (bundleset) {
        res.status(200).send(bundleset);
    })

    promise.catch(function (err) {
        return res.status(501).json({message: 'Some internal error'});
    })
});

module.exports = router;
