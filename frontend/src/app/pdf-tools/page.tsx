'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, ArrowRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const pdfTools = [
  { id: 'merge', label: '🔗 Merge PDFs', desc: 'Combine multiple PDFs into one', multiple: true, fields: [] },
  { id: 'split', label: '✂️ Split PDF', desc: 'Split into individual pages', multiple: false, fields: [] },
  { id: 'rotate', label: '🔄 Rotate PDF', desc: 'Rotate pages 90°/180°/270°', multiple: false, fields: [{ name: 'angle', label: 'Rotation Angle', type: 'select', options: ['90', '180', '270'] }] },
  { id: 'watermark', label: '💧 Watermark', desc: 'Add text watermark to all pages', multiple: false, fields: [{ name: 'text', label: 'Watermark Text', type: 'text', placeholder: 'CONFIDENTIAL' }, { name: 'opacity', label: 'Opacity (0.1-1.0)', type: 'text', placeholder: '0.3' }] },
  { id: 'delete-pages', label: '🗑️ Delete Pages', desc: 'Remove specific pages', multiple: false, fields: [{ name: 'pagesToDelete', label: 'Pages to delete (e.g. 1,3,5)', type: 'text', placeholder: '1,3,5' }] },
  { id: 'info', label: '📋 PDF Info', desc: 'View page count, author, metadata', multiple: false, fields: [] },
]

export default function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState(pdfTools[0])
  const [files, setFiles] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(selectedTool.multiple ? acceptedFiles : [acceptedFiles[0]])
    setResult(null)
  }, [selectedTool])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: selectedTool.multiple
  })

  async function process() {
    if (files.length === 0) return toast.error('Please upload a PDF file first')
    if (selectedTool.id === 'merge' && files.length < 2) return toast.error('Upload at least 2 PDFs to merge')

    setProcessing(true); setResult(null)
    try {
      const formData = new FormData()
      if (selectedTool.multiple) files.forEach(f => formData.append('files', f))
      else formData.append('file', files[0])
      Object.entries(fieldValues).forEach(([k, v]) => { if (v) formData.append(k, v) })

      const res = await fetch(`${API}/api/pdf/${selectedTool.id}`, { method: 'POST', body: formData })
      const contentType = res.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed')
        setResult(data)
        toast.success('Done!')
      } else {
        if (!res.ok) throw new Error('Processing failed')
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const disp = res.headers.get('content-disposition')
        a.download = disp?.split('filename=')[1]?.replace(/"/g, '') || `${selectedTool.id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Downloaded!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Processing failed')
    } finally { setProcessing(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-4">
            <FileText className="w-3 h-3" /> PDF Tools
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">PDF Tools</h1>
          <p className="text-white/40 text-sm">Merge, split, rotate, watermark and more</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl border border-dark-500/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-500/40">
              <h3 className="text-sm font-semibold text-white/70">Select Tool</h3>
            </div>
            {pdfTools.map((tool) => (
              <button key={tool.id} onClick={() => { setSelectedTool(tool); setFiles([]); setResult(null); setFieldValues({}) }}
                className={`w-full text-left px-4 py-3.5 transition-all border-l-2 ${selectedTool.id === tool.id ? 'bg-amber-500/10 border-l-amber-500 text-white' : 'border-l-transparent text-white/50 hover:bg-white/3 hover:text-white/80'}`}>
                <div className="text-sm font-medium mb-0.5">{tool.label}</div>
                <p className="text-xs text-white/30">{tool.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl border border-amber-500/20 p-4">
              <h3 className="text-base font-semibold text-white mb-1">{selectedTool.label}</h3>
              <p className="text-sm text-white/40">{selectedTool.desc}</p>
            </div>

            {selectedTool.fields.length > 0 && (
              <div className="glass rounded-2xl border border-dark-500/40 p-5 space-y-4">
                {selectedTool.fields.map((field: any) => (
                  <div key={field.name}>
                    <label className="block text-sm text-white/60 mb-2">{field.label}</label>
                    {field.type === 'select' ? (
                      <select value={fieldValues[field.name] || ''} onChange={e => setFieldValues(p => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-4 py-3 glass rounded-xl border border-dark-500/40 text-white bg-dark-700 text-sm focus:outline-none focus:border-amber-500/50">
                        <option value="">Select...</option>
                        {field.options?.map((o: string) => <option key={o} value={o}>{o}°</option>)}
                      </select>
                    ) : (
                      <input type="text" placeholder={field.placeholder} value={fieldValues[field.name] || ''}
                        onChange={e => setFieldValues(p => ({ ...p, [field.name]: e.target.value }))}
                        className="w-full px-4 py-3 glass rounded-xl border border-dark-500/40 text-white placeholder-white/20 text-sm focus:outline-none focus:border-amber-500/50" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div {...getRootProps()} className={`glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-amber-400 bg-amber-500/10' : 'border-dark-500/60 hover:border-amber-500/40 hover:bg-amber-500/5'}`}>
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-medium mb-1">{selectedTool.multiple ? 'Drop multiple PDF files' : 'Drop your PDF file here'}</p>
              <p className="text-white/30 text-sm">PDF files only • Max 100MB</p>
            </div>

            {files.length > 0 && (
              <div className="glass rounded-xl border border-dark-500/40 p-4 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="text-white/70 truncate flex-1">{f.name}</span>
                    <span className="text-white/30 text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {result?.info && (
              <div className="glass rounded-xl border border-emerald-500/20 p-5">
                <h4 className="text-sm font-semibold text-emerald-400 mb-3">PDF Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.info).map(([k, v]) => (
                    <div key={k} className="glass rounded-lg p-3">
                      <p className="text-xs text-white/30 capitalize mb-1">{k}</p>
                      <p className="text-sm text-white font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={process} disabled={processing || files.length === 0}
              className="w-full py-4 flex items-center justify-center gap-2 text-base font-semibold rounded-xl text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              {processing
                ? <><div className="loading-dots"><span></span><span></span><span></span></div> Processing...</>
                : <>{selectedTool.label.split(' ').slice(1).join(' ')} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
