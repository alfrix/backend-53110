import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { __dirname } from '../utils.js';
import { logger } from './log.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folderType;

        switch (file.fieldname) {
            case 'profilePicture':
                folderType = 'profiles';
                break;
            case 'ident':
            case 'comDomicilio':
            case 'comCuenta':
                folderType = 'documents';
                break;
            case 'thumbnails':
                folderType = 'products';
                break;
            default:
                logger.error(`Campo desconocido ${file.fieldname}`)
                return cb(new Error(`Campo desconocido ${file.fieldname}`), null);
        }

        const uploadPath = path.join(__dirname, 'uploads', folderType);

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const userId = req.params.uid || req.session.user._id;
        const timestamp = Date.now();
        let fileName = "";
        const extension = `${path.extname(file.originalname)}`
        switch (file.fieldname) {
            case 'profilePicture':
            case 'ident':
            case 'comDomicilio':
            case 'comCuenta':
                fileName = `${file.fieldname}-${userId}`;
                break;
            case 'thumbnails':
                fileName = `${timestamp}-${userId}`;
                break;
            default:
                logger.error(`Campo desconocido ${file.fieldname}`)
                return cb(new Error(`Campo desconocido ${file.fieldname}`), null);
        }

        cb(null, `${fileName}${extension}`);
    }
});

const upload = multer({ storage: storage });

export { upload };