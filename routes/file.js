const express = require('express');
const router = express.Router();

const mongoose = require('mongoose')

const GridFsStorage = require('multer-gridfs-storage');

const db_url = require('../models/db_url')

const multer = require("multer");
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const path = require('path');

const cors = require('cors')
let fileSaved = [];

router.use(cors({
    allowedOrigins: [
        '*'
    ]
}));

let gfs;

// let mongoURI = "mongodb://localhost:27017/havenofbundles";
// let mongoURI = "mongodb://localhost:27017/havenofbundles";

let connection = require('../connection/Connection');
connection.connectionDb.then(res => {
    gfs = Grid(res.connections[0].db, mongoose.mongo);
    gfs.collection('uploads');
    // gfs.collection('movies');
});

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
                    filename: file.originalname,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
                fileSaved.push(file.originalname);
                console.log('file', fileSaved);
            });
        });
    }
});

const upload = multer({storage});

// @route GET /
// @desc Loads form
router.get('/files', async (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', {files: false});
        } else {
            files.map(file => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.status(200).send(files);
            // res.render('index', {files: files, title: 'Express'});
        }
    });
});

// @route GET /
// @desc Loads form
router.get('/file/:file', async (req, res) => {
    const file = req.params.file;
    gfs.files.find({"_id": file}).toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            res.render('index', {files: false});
        } else {
            files.map(file => {
                if (
                    file.contentType === 'image/jpeg' ||
                    file.contentType === 'image/png'
                ) {
                    file.isImage = true;
                } else {
                    file.isImage = false;
                }
            });
            res.status(200).send(files);
        }
    });
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/upload', upload.array('file', 10), (req, res) => {
    const files = fileSaved;
    fileSaved = [];
    res.json({"files": files});
});

// @route POST /upload
// @desc  Uploads file to DB
router.post('/uploadImgProfil', upload.single("file"), (req, res) => {
    res.json({"filename": fileSaved[0]});
});

// @route GET /files
// @desc  Display all files in JSON
router.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});

// @route GET /file
// @desc  Display all files in JSON
router.get('/file/:filename', (req, res) => {
    const filename = req.params.filename;
    gfs.files.findOne({filename: filename})((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }

        // Files exist
        return res.json(files);
    });
});


// @route GET /image/:filename
// @desc Display Image
router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        // Check if file
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if image
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
            console.log(res)
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

// @route DELETE /files/:id
// @desc  Delete file
router.delete('/files/:filename', (req, res) => {
    gfs.remove({filename: req.params.filename, root: 'uploads'}, (err, gridStore) => {
        if (err) {
            return res.status(404).json({err: err, message: "failed"});
        } else {
            return res.status(200).json({message: "success"});
        }

        // res.redirect('/');
    });
});

module.exports = router;
