import ExcelJS from 'exceljs'
import { redisClient } from '../config/redis'
import { prisma } from '../config/database'
import { generateCaseNumber } from '../utils/case-number'
import { v4 as uuidv4 } from 'uuid'

const COLUMN_MAP: Record<string, string> = {
  DATA: 'operationDate',
  'DATA SCADENZ': 'expiryDate',
  'DATA SCADENZA': 'expiryDate',
  'DATA DECORREN': 'effectDate',
  'DATA DECORRENZA': 'effectDate',
  AGGIORNAMENTI: 'notes',
  'COGNOME NOME': 'customerFullName',
  COGNOME: 'customerLastName',
  NOME: 'customerFirstName',
  TARGA: 'licensePlate',
  ENTRATA: 'grossPremium',
  USCITA: 'partnerCost',
  SBILANCIO: 'margin',
  'CASSA SCUDIERI': 'scudieriAmount',
  'CASSA MOBILITY': 'mobilityAmount',
  'COSTI AGGIUNT': 'additionalCosts',
  'TIPO EFFETTO': 'caseType',
  PERTNER: 'partnerName',
  PARTNER: 'partnerName',
  'RIFERIMENTO / COLLABORATORE': 'collaboratorName',
  COLLABORATORE: 'collaboratorName',
  RIFERIMENTO: 'collaboratorName',
  FRAZIONAM: 'paymentFrequency',
  'IMPORTO RATA': 'installmentAmount',
  'RATA COLLAB': 'collaboratorInstallment',
  'TRACCIA PAGAMENTO IN': 'paymentInReference',
  'TRACCIA PAGAM OUT': 'paymentOutReference',
  'CONTO CORRENTE': 'bankAccount',
}

function normalizeHeader(h: string): string {
  return h?.toString().trim().toUpperCase().replace(/\s+/g, ' ') || ''
}

function parseExcelDate(v: any): Date | undefined {
  if (!v) return undefined
  if (v instanceof Date) return v
  if (typeof v === 'number') {
    const d = new Date((v - 25569) * 86400 * 1000)
    return isNaN(d.getTime()) ? undefined : d
  }
  const parsed = new Date(v)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === '') return undefined
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v)
  return isNaN(n) ? undefined : n
}

export const importService = {
  async preview(buffer: Buffer, filename: string) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer as any)

    const allRows: any[] = []
    const errors: any[] = []
    const warnings: any[] = []

    for (const sheet of workbook.worksheets) {
      const name = sheet.name.trim().toUpperCase()
      // Solo fogli mensili (contengono anno nel nome o "26"/"25")
      if (!name.match(/\d{2}/) && !['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'].some((m) => name.includes(m))) {
        continue
      }

      // Trova header row (prima riga non vuota)
      let headerRow: ExcelJS.Row | null = null
      let headerIndex = 0
      sheet.eachRow((row, i) => {
        if (!headerRow) {
          const vals = row.values as any[]
          const hasContent = vals.some((v) => v && normalizeHeader(v?.toString()).length > 2)
          if (hasContent) {
            headerRow = row
            headerIndex = i
          }
        }
      })

      if (!headerRow) continue

      const headers: string[] = []
      ;((headerRow as ExcelJS.Row).values as any[]).forEach((v, idx) => {
        headers[idx] = normalizeHeader(v?.toString() || '')
      })

      sheet.eachRow((row, rowIndex) => {
        if (rowIndex <= headerIndex) return

        const rawVals = row.values as any[]
        if (!rawVals || rawVals.every((v) => !v)) return

        const raw: Record<string, any> = {}
        headers.forEach((h, idx) => {
          if (h && rawVals[idx] !== undefined) {
            const field = COLUMN_MAP[h]
            if (field) raw[field] = rawVals[idx]
          }
        })

        // Salta righe senza cliente o importo
        if (!raw.customerFullName && !raw.customerLastName) return
        if (!raw.grossPremium && !raw.partnerCost) return

        const rowData: Record<string, any> = {
          _sheet: sheet.name,
          _row: rowIndex,
          _raw: { ...raw },
        }

        // Normalizza targa
        if (raw.licensePlate) {
          rowData.licensePlate = raw.licensePlate.toString().toUpperCase().replace(/\s/g, '')
        }

        // Normalizza cliente
        if (raw.customerFullName) {
          const parts = raw.customerFullName.toString().trim().split(/\s+/)
          rowData.customerLastName = parts[0] || ''
          rowData.customerFirstName = parts.slice(1).join(' ') || ''
        } else {
          rowData.customerLastName = raw.customerLastName?.toString().trim() || ''
          rowData.customerFirstName = raw.customerFirstName?.toString().trim() || ''
        }

        rowData.partnerName = raw.partnerName?.toString().trim()
        rowData.collaboratorName = raw.collaboratorName?.toString().trim()
        rowData.caseType = raw.caseType?.toString().trim()
        rowData.notes = raw.notes?.toString().trim()
        rowData.paymentFrequency = raw.paymentFrequency?.toString().trim()
        rowData.grossPremium = toNum(raw.grossPremium)
        rowData.partnerCost = toNum(raw.partnerCost)
        rowData.additionalCosts = toNum(raw.additionalCosts) || 0
        rowData.scudieriAmount = toNum(raw.scudieriAmount) || 0
        rowData.mobilityAmount = toNum(raw.mobilityAmount) || 0
        rowData.effectDate = parseExcelDate(raw.effectDate)
        rowData.expiryDate = parseExcelDate(raw.expiryDate)
        rowData.bankAccount = raw.bankAccount?.toString().trim()
        rowData.paymentInReference = raw.paymentInReference?.toString().trim()
        rowData.paymentOutReference = raw.paymentOutReference?.toString().trim()

        allRows.push(rowData)
      })
    }

    const importSessionId = uuidv4()
    await redisClient.set(`import:${importSessionId}`, JSON.stringify({ rows: allRows, filename }), 'EX', 1800)

    return {
      importSessionId,
      totalRows: allRows.length,
      validRows: allRows.filter((r) => r.customerLastName && (r.grossPremium || r.partnerCost)).length,
      errorRows: errors.length,
      warnings: warnings.length,
      preview: allRows.slice(0, 50),
    }
  },

  async confirm(importSessionId: string, userId: string) {
    const raw = await redisClient.get(`import:${importSessionId}`)
    if (!raw) throw new Error('Sessione di import scaduta o non trovata')

    const { rows, filename } = JSON.parse(raw) as { rows: any[]; filename: string }

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        await prisma.$transaction(async (tx) => {
          // Upsert customer
          let customer = null
          if (row.customerLastName) {
            customer = await tx.customer.upsert({
              where: { fiscalCode: `IMPORT-${row.customerLastName}-${row.customerFirstName}`.toUpperCase().slice(0, 50) },
              update: {},
              create: {
                firstName: row.customerFirstName || '',
                lastName: row.customerLastName || '',
                fiscalCode: `IMPORT-${row.customerLastName}-${row.customerFirstName}`.toUpperCase().slice(0, 50),
                importedFromExcel: true,
              },
            })
          }
          if (!customer) { skipped++; return }

          // Upsert vehicle
          let vehicle = null
          if (row.licensePlate) {
            vehicle = await tx.vehicle.upsert({
              where: { licensePlate: row.licensePlate },
              update: {},
              create: {
                licensePlate: row.licensePlate,
                customerId: customer.id,
                importedFromExcel: true,
              },
            })
          }

          // Upsert partner
          let partner = null
          if (row.partnerName) {
            partner = await tx.partner.upsert({
              where: { name: row.partnerName },
              update: {},
              create: { name: row.partnerName },
            })
          }

          // Upsert collaborator
          let collaborator = null
          if (row.collaboratorName) {
            const existing = await tx.collaborator.findFirst({
              where: { lastName: { equals: row.collaboratorName, mode: 'insensitive' } },
            })
            if (existing) {
              collaborator = existing
            } else {
              const parts = row.collaboratorName.split(' ')
              collaborator = await tx.collaborator.create({
                data: { firstName: parts.slice(1).join(' ') || row.collaboratorName, lastName: parts[0] },
              })
            }
          }

          const caseNumber = await generateCaseNumber()
          await tx.insuranceCase.create({
            data: {
              caseNumber,
              customerId: customer.id,
              vehicleId: vehicle?.id,
              partnerId: partner?.id,
              collaboratorId: collaborator?.id,
              caseType: row.caseType,
              grossPremium: row.grossPremium,
              partnerCost: row.partnerCost,
              additionalCosts: row.additionalCosts,
              scudieriAmount: row.scudieriAmount,
              mobilityAmount: row.mobilityAmount,
              effectDate: row.effectDate,
              expiryDate: row.expiryDate,
              paymentFrequency: row.paymentFrequency,
              notes: row.notes,
              paymentInReference: row.paymentInReference,
              paymentOutReference: row.paymentOutReference,
              bankAccount: row.bankAccount,
              importedFromExcel: true,
              excelSheetName: row._sheet,
              excelRowRef: `${row._sheet}:${row._row}`,
            },
          })
        })

        imported++
      } catch (err: any) {
        errors.push(`Riga ${row._sheet}:${row._row} — ${err.message}`)
        skipped++
      }
    }

    await prisma.auditLog.create({
      data: {
        action: 'IMPORT',
        entity: 'insurance_cases',
        userId,
        newValues: { filename, imported, skipped, errors: errors.length },
      },
    })

    await redisClient.del(`import:${importSessionId}`)

    return { imported, skipped, errors }
  },
}
