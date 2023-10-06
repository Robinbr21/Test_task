import { Router } from "express";

import fs from 'fs'

import {uploadcontroller} from "../Controller/index.mjs"

import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = '/';
        fs.mkdirSync(dir, { recursive: true });
            return cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'data' +
            file.mimetype.split("/").reverse()[0]
        );
    }
});
const upload = multer({ storage: storage });

const router = Router()
console.log("inside the upload router");
router.get('/',uploadcontroller.index);


export default router