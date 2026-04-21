import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { env } from './env'

function buildUploadDir(customerId: string): string {
  const now = new Date()
  const year = now.getFullYear().toString()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return path.join(env.UPLOAD_BASE_PATH, year, month, customerId)
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const customerId = req.body?.customerId || 'unknown'
    const dir = buildUploadDir(customerId)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}${ext}`)
  },
})

const allowedMimes = env.UPLOAD_ALLOWED_MIME_TYPES.split(',').map((m) => m.trim())

export const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo file non consentito: ${file.mimetype}`))
    }
  },
})

export const uploadTemp = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const excelMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (excelMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo file Excel (.xlsx, .xls) sono accettati'))
    }
  },
})

export { buildUploadDir }
