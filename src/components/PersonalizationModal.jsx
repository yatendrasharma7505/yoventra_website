import { useState } from 'react';
import { X, Upload, Trash2, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export function PersonalizationModal({ isOpen, onClose, product, onConfirm, confirmLabel = 'Add to Cart' }) {
  const [photos, setPhotos] = useState([]); // array of { file, preview, url, uploading, error }
  const [customText, setCustomText] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen || !product) return null;

  const minPhotos = product.personalisationMinPhotos ?? product.minPhotos ?? 1;
  const maxPhotos = product.personalisationMaxPhotos ?? product.maxPhotos ?? 10;
  const requiresText = product.personalisationRequiresText ?? false;

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (photos.length + selectedFiles.length > maxPhotos) {
      setError(`You can upload at most ${maxPhotos} photos.`);
      return;
    }

    setError(null);

    const newSlots = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
      uploading: true,
      error: null,
    }));

    setPhotos((prev) => [...prev, ...newSlots]);

    // Upload each file to Cloudinary via backend API
    for (let i = 0; i < newSlots.length; i++) {
      const slot = newSlots[i];
      try {
        const res = await api.uploadFile(slot.file);
        setPhotos((current) =>
          current.map((p) => (p.preview === slot.preview ? { ...p, url: res.url, uploading: false } : p))
        );
      } catch (err) {
        setPhotos((current) =>
          current.map((p) =>
            p.preview === slot.preview ? { ...p, uploading: false, error: 'Upload failed' } : p
          )
        );
      }
    }
  };

  const handleRemovePhoto = (preview) => {
    setPhotos((prev) => prev.filter((p) => p.preview !== preview));
  };

  const handleConfirm = () => {
    const uploadedUrls = photos.filter((p) => p.url).map((p) => p.url);

    if (uploadedUrls.length < minPhotos) {
      setError(`Please upload at least ${minPhotos} photo(s). Currently uploaded: ${uploadedUrls.length}`);
      return;
    }

    if (requiresText && !customText.trim()) {
      setError('Please provide the personalized text/message.');
      return;
    }

    onConfirm({
      photos: uploadedUrls,
      text: customText.trim(),
    });
  };

  const isUploadingAny = photos.some((p) => p.uploading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-extrabold font-display text-foreground">
              Personalize Your Gift
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-danger-bg p-3 text-xs sm:text-sm font-semibold text-danger border border-danger/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6 flex-1">
          {/* Photo upload section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Upload Photos ({photos.length}/{maxPhotos})
              </label>
              <span className="text-xs font-bold text-accent">Min: {minPhotos}</span>
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {photos.map((p, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-background">
                  <img src={p.preview} alt="Upload preview" className="h-full w-full object-cover" />
                  {p.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {p.error && (
                    <div className="absolute inset-0 bg-danger/80 flex items-center justify-center p-1 text-[10px] text-white text-center font-bold">
                      Failed
                    </div>
                  )}
                  <button
                    onClick={() => handleRemovePhoto(p.preview)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-danger transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {photos.length < maxPhotos && (
                <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 cursor-pointer transition-all">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-[11px] font-bold text-muted-foreground">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Custom text/message */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Custom Message / Instructions {requiresText && '*'}
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. 'Happy 1st Anniversary Priya & Rohan' or any custom text to print"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-medium text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-border flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground hover:bg-secondary transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUploadingAny || photos.length < minPhotos}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-extrabold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-all shadow-md"
          >
            {isUploadingAny ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
