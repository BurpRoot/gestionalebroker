import path from 'path'
import fs from 'fs'
import { prisma } from '../config/database'

export const documentService = {
  async findByCaseId(caseId: string) {
    return prisma.document.findMany({
      where: { caseId },
      orderBy: { uploadedAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.document.findUnique({ where: { id } })
  },

  async create(data: {
    caseId: string
    fileName: string
    storedPath: string
    mimeType: string
    sizeBytes: number
    documentType: any
    description?: string
  }) {
    const doc = await prisma.document.create({ data })

    await prisma.caseEvent.create({
      data: {
        caseId: data.caseId,
        eventType: 'DOCUMENT_ADDED',
        description: `Documento caricato: ${data.fileName}`,
        metadata: { documentId: doc.id, documentType: data.documentType },
      },
    })

    return doc
  },

  async delete(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } })
    if (!doc) throw new Error('Documento non trovato')

    const absPath = path.resolve(doc.storedPath)
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath)
    }

    await prisma.document.delete({ where: { id } })
    return doc
  },

  getAbsolutePath(storedPath: string) {
    return path.resolve(storedPath)
  },
}
