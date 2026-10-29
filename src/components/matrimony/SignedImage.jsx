import { useEffect, useState } from 'react'
import { UserRound } from 'lucide-react'
import { getSignedUrl } from '../../services/matrimonyService'

/** Shows an image from a private bucket via a short-lived signed URL. */
export default function SignedImage({ bucket, path, alt = '', className = '' }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let live = true
    setUrl(null)
    if (path) getSignedUrl(bucket, path).then((u) => live && setUrl(u))
    return () => { live = false }
  }, [bucket, path])

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-linen-100 text-slate-300 ${className}`} aria-label={alt}>
        <UserRound size={28} />
      </div>
    )
  }
  return <img src={url} alt={alt} className={`object-cover ${className}`} loading="lazy" />
}
