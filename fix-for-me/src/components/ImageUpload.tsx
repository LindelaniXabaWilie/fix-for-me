import { useState, type ChangeEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

type Props = {
  bucket: string
  pathPrefix: string
  maxFiles?: number
  onChange: (urls: string[]) => void
}

export default function ImageUpload({ bucket, pathPrefix, maxFiles = 4, onChange }: Props) {
  const [urls, setUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (urls.length + files.length > maxFiles) {
      setError(`You can attach up to ${maxFiles} photos.`)
      return
    }

    setUploading(true)
    setError(null)

    const uploaded: string[] = []
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${pathPrefix}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file)
      if (uploadError) {
        setError(uploadError.message)
        continue
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }

    const next = [...urls, ...uploaded]
    setUrls(next)
    onChange(next)
    setUploading(false)
    e.target.value = ''
  }

  function removeAt(i: number) {
    const next = urls.filter((_, idx) => idx !== i)
    setUrls(next)
    onChange(next)
  }

  return (
    <div className="image-upload">
      <label className="image-upload-input">
        {uploading ? 'Uploading…' : 'Add photos'}
        <input type="file" accept="image/*" multiple onChange={handleFiles} hidden />
      </label>
      {error && <p className="page-error">{error}</p>}
      {urls.length > 0 && (
        <div className="image-upload-preview">
          {urls.map((url, i) => (
            <div key={url} className="image-upload-thumb">
              <img src={url} alt="" />
              <button type="button" onClick={() => removeAt(i)} aria-label="Remove photo">&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}