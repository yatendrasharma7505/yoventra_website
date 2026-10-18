import { api } from '../api/client';

/**
 * Background uploads for gift photos. Picking a photo starts its upload here
 * and returns an id straight away, so the customer can fill in the gift's
 * details, save it and walk to checkout while photos are still going up.
 * Checkout waits for them (waitForUploads) only when the order is placed.
 *
 * Lives at module level, so uploads keep running across page changes inside
 * the site. A full page reload loses them — waitForUploads then reports the
 * photos as missing so the customer can add them again.
 */

const tasks = new Map(); // id -> { file, url, error, promise }
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function run(id) {
  const task = tasks.get(id);
  task.error = null;
  task.promise = api.uploadFile(task.file).then(
    (res) => {
      task.url = res.url;
      notify();
      return res.url;
    },
    (err) => {
      task.error = err;
      notify();
      throw err;
    },
  );
  // Waiters handle the error; this only stops an "unhandled rejection".
  task.promise.catch(() => {});
  notify();
}

/** Starts uploading [file] in the background; returns its upload id. */
export function queueUpload(file) {
  const id = `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  tasks.set(id, { file, url: null, error: null, promise: null });
  run(id);
  return id;
}

export function retryUpload(id) {
  if (tasks.has(id)) run(id);
}

/** 'done' | 'uploading' | 'failed' | 'missing' (lost to a page reload). */
export function uploadStatus(id) {
  const task = tasks.get(id);
  if (!task) return 'missing';
  if (task.url) return 'done';
  if (task.error) return 'failed';
  return 'uploading';
}

export function uploadedUrl(id) {
  return tasks.get(id)?.url ?? null;
}

/** Re-render hook-up: calls [fn] whenever any upload changes state. */
export function subscribeUploads(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Resolves each id to its URL, waiting for uploads still in progress.
 * Throws if one failed or no longer exists. */
export async function waitForUploads(ids) {
  return Promise.all(
    ids.map(async (id) => {
      const task = tasks.get(id);
      if (!task) throw new Error('missing');
      if (task.url) return task.url;
      // Failed while the customer was busy elsewhere — one more try now.
      if (task.error) run(id);
      return task.promise;
    }),
  );
}

/** Fills in every photo URL of a gift's personalisation, waiting for any
 * still uploading. Throws an Error with a customer-facing message when a
 * photo failed or was lost to a page reload. */
export async function finishCustomizationUploads(customization) {
  if (!Array.isArray(customization?.uploads)) return customization;
  const pending = customization.uploads.filter((u) => !u.url);
  if (!pending.length) return customization;
  let urls;
  try {
    urls = await waitForUploads(pending.map((u) => u.id));
  } catch {
    throw new Error('Some gift photos could not be uploaded. Please remove the gift from your cart and personalise it again.');
  }
  const byId = new Map(pending.map((u, i) => [u.id, urls[i]]));
  return {
    ...customization,
    uploads: customization.uploads.map((u) => (u.url ? u : { ...u, url: byId.get(u.id) })),
  };
}
