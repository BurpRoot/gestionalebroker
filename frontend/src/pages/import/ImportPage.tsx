import React, { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { Upload, CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { importApi } from '../../api/importApi'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

type Step = 'upload' | 'preview' | 'confirm' | 'done'

const fmt = (n: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n)

export const ImportPage: React.FC = () => {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [result, setResult] = useState<any>(null)

  const previewMutation = useMutation({
    mutationFn: (f: File) => importApi.preview(f),
    onSuccess: (data) => {
      setPreviewData(data)
      setStep('preview')
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => importApi.confirm(previewData.importSessionId),
    onSuccess: (data) => {
      setResult(data)
      setStep('done')
    },
  })

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
  })

  const steps = ['Carica file', 'Anteprima', 'Conferma', 'Completato']
  const stepIndex = { upload: 0, preview: 1, confirm: 2, done: 3 }[step]

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Importa da Excel</h1>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i < stepIndex
                  ? 'bg-green-500 border-green-500 text-white'
                  : i === stepIndex
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${i === stepIndex ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${i < stepIndex ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet size={40} className="mx-auto mb-3 text-slate-400" />
            {file ? (
              <div>
                <p className="font-semibold text-slate-700">{file.name}</p>
                <p className="text-sm text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 font-medium">Trascina qui il file Excel (.xlsx)</p>
                <p className="text-sm text-slate-400 mt-1">oppure clicca per selezionare</p>
              </div>
            )}
          </div>
          {file && (
            <div className="mt-4 flex justify-end">
              <Button
                icon={<ArrowRight size={16} />}
                loading={previewMutation.isPending}
                onClick={() => previewMutation.mutate(file)}
              >
                Analizza file
              </Button>
            </div>
          )}
          {previewMutation.isError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              Errore durante l'analisi del file. Verifica che sia un file Excel valido.
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && previewData && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Righe totali', value: previewData.totalRows, color: 'text-slate-800' },
              { label: 'Righe valide', value: previewData.validRows, color: 'text-green-600' },
              { label: 'Righe con errori', value: previewData.errorRows, color: 'text-red-600' },
              { label: 'Duplicati', value: previewData.duplicateRows, color: 'text-orange-500' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Anteprima righe</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="text-left pb-2 font-medium">#</th>
                    <th className="text-left pb-2 font-medium">Stato</th>
                    <th className="text-left pb-2 font-medium">Targa</th>
                    <th className="text-left pb-2 font-medium">Cliente</th>
                    <th className="text-left pb-2 font-medium">Partner</th>
                    <th className="text-right pb-2 font-medium">Entrata</th>
                    <th className="text-left pb-2 font-medium">Errore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(previewData.preview || []).slice(0, 50).map((row: any, i: number) => (
                    <tr key={i} className={row.status === 'ERROR' ? 'bg-red-50' : row.status === 'DUPLICATE' ? 'bg-orange-50' : ''}>
                      <td className="py-1.5">{row.rowNumber || i + 1}</td>
                      <td className="py-1.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                          row.status === 'VALID' ? 'bg-green-100 text-green-700'
                          : row.status === 'ERROR' ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                        }`}>
                          {row.status === 'VALID' ? 'OK' : row.status === 'ERROR' ? 'ERRORE' : 'DUPL.'}
                        </span>
                      </td>
                      <td className="py-1.5 font-mono">{row.licensePlate || '—'}</td>
                      <td className="py-1.5">{row.customerName || '—'}</td>
                      <td className="py-1.5">{row.partnerName || '—'}</td>
                      <td className="py-1.5 text-right">{row.grossPremium != null ? fmt(Number(row.grossPremium)) : '—'}</td>
                      <td className="py-1.5 text-red-600 max-w-xs truncate">{row.error || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(previewData.preview || []).length > 50 && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Mostrate le prime 50 righe di {previewData.preview.length}
                </p>
              )}
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setStep('upload'); setPreviewData(null) }}>
              Annulla
            </Button>
            <Button
              icon={<ArrowRight size={16} />}
              disabled={previewData.validRows === 0}
              onClick={() => setStep('confirm')}
            >
              Continua ({previewData.validRows} righe valide)
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && previewData && (
        <Card className="text-center py-8">
          <Upload size={40} className="mx-auto mb-3 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Conferma importazione</h2>
          <p className="text-sm text-slate-500 mb-6">
            Verranno importate <strong>{previewData.validRows}</strong> pratiche.{' '}
            {previewData.duplicateRows > 0 && `${previewData.duplicateRows} duplicate verranno saltate.`}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setStep('preview')}>Indietro</Button>
            <Button
              loading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate()}
            >
              Importa ora
            </Button>
          </div>
          {confirmMutation.isError && (
            <p className="mt-3 text-sm text-red-600">Errore durante l'importazione. Riprova.</p>
          )}
        </Card>
      )}

      {/* Step 4: Done */}
      {step === 'done' && result && (
        <Card className="text-center py-8">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Importazione completata!</h2>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div>
              <p className="text-2xl font-bold text-green-600">{result.imported ?? 0}</p>
              <p className="text-slate-500">Importate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{result.skipped ?? 0}</p>
              <p className="text-slate-500">Saltate</p>
            </div>
            {result.errors > 0 && (
              <div>
                <p className="text-2xl font-bold text-red-500">{result.errors}</p>
                <p className="text-slate-500">Errori</p>
              </div>
            )}
          </div>
          <Button
            className="mt-6"
            onClick={() => { setStep('upload'); setFile(null); setPreviewData(null); setResult(null) }}
          >
            Nuova importazione
          </Button>
        </Card>
      )}
    </div>
  )
}
