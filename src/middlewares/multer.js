import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../utils.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.params.uid;
        const folderType = req.body.folderType || 'products'; // profiles, documents, or products
        const uploadPath = path.join(__dirname, 'uploads', userId, folderType);

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

export { upload };