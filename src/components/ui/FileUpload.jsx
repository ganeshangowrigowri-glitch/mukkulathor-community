import { useRef, useState } from 'react'
import { UploadCloud, FileCheck2, X } from 'lucide-react'

export default function FileUpload({ label, accept = 'image/*', multiple = false, onFiles, hint }) {
  const inputRef = useRef(null)
  const [fileNames, setFileNames] = useState([])

  function handleChange(e) {
    const files = Array.from(e.target.files || [])
    setFileNames(files.map((f) => f.name))
    onFiles?.(multiple ? files : files[0])
  }

  function clear() {
    setFileNames([])
    if (inputRef.current) inputRef.current.value = ''
    onFiles?.(multiple ? [] : null)
  }

  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm2 border-2 border-dashed border-slate-300 bg-slate-25 px-4 py-6 text-center hover:border-navy-400 hover:bg-navy-50/40"
      >
        {fileNames.length === 0 ? (
          <>
            <UploadCloud className="text-slate-400" size={26} />
            <p className="text-sm text-slate-500">Click to upload {multiple ? 'files' : 'a file'}</p>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
          </>
        ) : (
          <div className="w-full space-y-1">
            {fileNames.map((name) => (
              <div key={name} className="flex items-center justify-between gap-2 rounded bg-emerald-50 px-3 py-1.5 text-left text-sm text-emerald-700">
                <span className="flex items-center gap-1.5 truncate"><FileCheck2 size={14} /> {name}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear() }}
              className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-red-500"
            >
              <X size={12} /> Remove
            </button>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
    </div>
  )
}
