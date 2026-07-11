import FileUpload from '../../ui/FileUpload'

export default function UploadsSection({ profile, onProfilePhoto, onFamilyPhotos, onSupportingDocs }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-navy-900">Upload Documents &amp; Photos</h2>
      <p className="mt-1 text-sm text-slate-500">These help referees and the admin verify your identity and family history.</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <FileUpload label="Profile Photo" accept="image/*" onFiles={onProfilePhoto} hint="JPG or PNG, up to 5MB" />
        <FileUpload label="Family Photo(s)" accept="image/*" multiple onFiles={onFamilyPhotos} hint="You can select multiple photos" />
        <FileUpload
          label="Supporting Document(s)"
          accept="image/*,application/pdf"
          multiple
          onFiles={onSupportingDocs}
          hint="Any other document supporting your application"
        />
      </div>

      {profile?.profile_photo_url && (
        <div className="mt-4 flex items-center gap-3 rounded-sm2 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          A profile photo is already on file. Uploading a new one will replace it.
        </div>
      )}
    </div>
  )
}