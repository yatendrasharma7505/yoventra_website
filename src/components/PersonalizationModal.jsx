import { useEffect, useReducer, useRef, useState } from 'react';
import { X, ImagePlus, Trash2, Sparkles, Info, Loader2, RotateCw, Clock, CheckCircle2 } from 'lucide-react';
import { queueUpload, retryUpload, subscribeUploads, uploadStatus, uploadedUrl } from '../lib/uploadQueue';

/**
 * "Personalise your gift" — the same flow as the app's PersonaliseScreen:
 * product header, the admin's instructions, a photo grid with min/max and
 * per-photo retry, and one input per text question the product asks
 * (label, placeholder, required, max length).
 *
 * Photos upload in the background (lib/uploadQueue): the customer can fill
 * in the details and save while they're still going up; checkout waits for
 * them when the order is placed. Hands back
 * { uploads: [{ id, url }], texts: [{ label, value }] } — see
 * toApiCustomization for the backend's shape.
 */
export function PersonalizationModal({ isOpen, onClose, product, size, onConfirm, confirmLabel = 'Add to Cart' }) {
  const config = product?.customization || {};
  const textFields = config.textFields || [];
  const minImages = Number(config.minImages ?? product?.personalisationMinPhotos ?? 0);
  const maxImages = Number(config.maxImages ?? product?.personalisationMaxPhotos ?? 0);

  const [photos, setPhotos] = useState([]); // { id (upload id), preview }
  const [answers, setAnswers] = useState(() => textFields.map(() => ''));
  const fileInput = useRef(null);
  const [, rerender] = useReducer((n) => n + 1, 0);

  // Re-render as background uploads finish or fail.
  useEffect(() => subscribeUploads(rerender), []);

  if (!isOpen || !product) return null;

  const statusOf = (p) => uploadStatus(p.id);
  const anyUploading = photos.some((p) => statusOf(p) === 'uploading');
  const anyFailed = photos.some((p) => statusOf(p) === 'failed');
  const usableCount = photos.filter((p) => statusOf(p) !== 'failed').length;

  // First unmet requirement, or null when the customer can continue. Photos
  // still uploading count — they finish in the background.
  let blocker = null;
  if (anyFailed) blocker = 'Retry or remove the failed photo';
  else if (usableCount < minImages) {
    const left = minImages - usableCount;
    blocker = `Add ${left} more photo${left === 1 ? '' : 's'}`;
  } else {
    const missing = textFields.find((f, i) => f.required && !answers[i]?.trim());
    if (missing) blocker = `Fill in "${missing.label}"`;
  }

  const handleFiles = (e) => {
    const remaining = maxImages - photos.length;
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, remaining));
    e.target.value = '';
    if (!files.length) return;
    const added = files.map((file) => ({ id: queueUpload(file), preview: URL.createObjectURL(file) }));
    setPhotos((cur) => [...cur, ...added]);
  };

  const removePhoto = (id) => setPhotos((cur) => cur.filter((p) => p.id !== id));

  const submit = () => {
    if (blocker) return;
    onConfirm({
      uploads: photos.map((p) => ({ id: p.id, url: uploadedUrl(p.id) })),
      texts: textFields
        .map((f, i) => ({ label: f.label, value: (answers[i] || '').trim() }))
        .filter((t) => t.value),
    });
  };

  const photoHint = config.imageHint
    || (minImages > 0 ? `Upload at least ${minImages} photo${minImages === 1 ? '' : 's'}` : 'Photos are optional');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-background border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-black text-foreground">Personalise your gift</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-6">
          {/* Product */}
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-xl object-contain bg-card border border-border"
            />
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-foreground line-clamp-2">{product.title}</div>
              {size && <div className="mt-0.5 text-xs text-muted-foreground">Size: {size}</div>}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                  <Sparkles className="h-3 w-3" /> Personalised
                </span>
                {config.handmade && (
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground">Handmade</span>
                )}
                {config.productionDays > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold text-foreground">
                    <Clock className="h-3 w-3" /> +{config.productionDays} days to make
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Admin instructions */}
          {config.instructions && (
            <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-[13px] leading-snug text-blue-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{config.instructions}</span>
            </div>
          )}

          {/* Photos */}
          {maxImages > 0 && (
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Your photos · {photos.length}/{maxImages}
                {minImages > 0 && <span className="text-accent"> *</span>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{photoHint}</div>

              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {photos.map((p) => (
                  <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
                    <img src={p.preview} alt="" className="h-full w-full object-cover" />
                    {statusOf(p) === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                    {statusOf(p) === 'done' && (
                      <CheckCircle2 className="absolute bottom-1 left-1 h-4 w-4 rounded-full bg-white text-success" />
                    )}
                    {statusOf(p) === 'failed' && (
                      <button
                        onClick={() => retryUpload(p.id)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 text-[11px] font-bold text-white"
                      >
                        <RotateCw className="h-4 w-4" /> Retry
                      </button>
                    )}
                    <button
                      onClick={() => removePhoto(p.id)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {photos.length < maxImages && (
                  <button
                    onClick={() => fileInput.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl border-[1.5px] border-accent/40 bg-accent/5 text-accent transition hover:bg-accent/10"
                  >
                    <ImagePlus className="h-6 w-6" />
                    <span className="mt-1 text-[11px] font-bold">Add photos</span>
                  </button>
                )}
              </div>
              {anyUploading && (
                <div className="mt-2 text-xs font-semibold text-muted-foreground">
                  Photos keep uploading in the background — fill in the details and continue.
                </div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple={maxImages - photos.length > 1}
                onChange={handleFiles}
                className="hidden"
              />
            </div>
          )}

          {/* Text questions */}
          {textFields.map((field, i) => {
            const max = field.maxLength || 100;
            const value = answers[i] || '';
            const setValue = (v) => setAnswers((cur) => cur.map((a, j) => (j === i ? v.slice(0, max) : a)));
            const inputClass = 'w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm font-medium text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20';
            return (
              <div key={field.label}>
                <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  {field.label}
                  {field.required && <span className="text-accent"> *</span>}
                </label>
                <div className="mt-2">
                  {max > 60 ? (
                    <textarea
                      rows={3}
                      value={value}
                      maxLength={max}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={field.placeholder || 'Type here'}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      value={value}
                      maxLength={max}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={field.placeholder || 'Type here'}
                      className={inputClass}
                    />
                  )}
                </div>
                <div className="mt-1 text-right text-[10.5px] text-muted-foreground">
                  {value.length}/{max}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {blocker && <div className="mb-2 text-center text-xs font-bold text-muted-foreground">{blocker}</div>}
          <button
            onClick={submit}
            disabled={Boolean(blocker)}
            className="w-full rounded-xl bg-accent py-3.5 text-sm font-extrabold text-accent-foreground shadow-md transition hover:bg-accent/90 disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
