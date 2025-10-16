import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createResponse } from "../../common/response.js";
import { config } from '../../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../public/upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件!'));
        }
    }
}).single('file');

export const uploadImage = (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json(createResponse(400, "error", null, "文件上传错误: " + err.message));
        } else if (err) {
            return res.status(400).json(createResponse(400, "error", null, err.message));
        }

        // 成功上传
        const fileUrl = config.baseUrl + `/upload/${req.file.filename}`;
        res.json(createResponse(200, "success", { url: fileUrl }, "上传成功"));

    });
}; 