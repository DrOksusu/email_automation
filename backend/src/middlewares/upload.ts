import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4();
    cb(null, uniqueName + ext);
  }
});

export const uploadPdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF 파일만 업로드 가능합니다.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploadCsv = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('CSV 파일만 업로드 가능합니다.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});
