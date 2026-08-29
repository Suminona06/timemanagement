/**
 * audioStorage.js — IndexedDB wrapper for persisting custom audio ringtones.
 *
 * Database  : "chronocraft_audio"
 * Store     : "custom_sounds"
 * Schema    : { id, name, mimeType, size, blob, createdAt }
 *
 * Supported Formats: mp3, wav, ogg, m4a, aac, flac, webm
 * Max File Size    : 10 MB per file
 */

const DB_NAME = 'chronocraft_audio';
const DB_VERSION = 1;
const STORE_NAME = 'custom_sounds';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  'audio/mpeg',      // .mp3
  'audio/mp3',
  'audio/wav',       // .wav
  'audio/wave',
  'audio/ogg',       // .ogg
  'audio/vorbis',
  'audio/mp4',       // .m4a
  'audio/x-m4a',
  'audio/aac',       // .aac
  'audio/flac',      // .flac
  'audio/x-flac',
  'audio/webm',      // .webm
  'audio/x-wav',
];

// ── IndexedDB Initialization ─────────────────────────────────────────────────

let _db = null;

/**
 * Open (or create) the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (e) => {
      _db = e.target.result;
      resolve(_db);
    };

    request.onerror = (e) => {
      reject(new Error(`Failed to open IndexedDB: ${e.target.error?.message}`));
    };
  });
}

/**
 * Run a transaction and return a Promise wrapping the request result.
 * @param {'readonly'|'readwrite'} mode
 * @param {(store: IDBObjectStore) => IDBRequest} fn
 * @returns {Promise<any>}
 */
async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(request.error?.message || 'IDB request failed'));
    tx.onerror = () => reject(new Error(tx.error?.message || 'IDB transaction failed'));
  });
}

// ── Audio File Validator ──────────────────────────────────────────────────────

/**
 * Validate a File before storage.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAudioFile(file) {
  if (!file) return { valid: false, error: 'No file provided.' };

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10 MB limit (current: ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }

  const mimeOk = ALLOWED_MIME_TYPES.includes(file.type);
  const extOk = /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name);

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: `Unsupported format "${file.type || file.name}". Allowed: mp3, wav, ogg, m4a, aac, flac, webm.`,
    };
  }

  return { valid: true };
}

// ── CRUD Operations ──────────────────────────────────────────────────────────

/**
 * Save a custom audio file to IndexedDB.
 * @param {File} file
 * @returns {Promise<{ id: string, name: string, mimeType: string, size: number, blobUrl: string, createdAt: string }>}
 */
export async function saveCustomSound(file) {
  const validation = validateAudioFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id,
    name: file.name.replace(/\.[^.]+$/, ''), // Strip extension
    mimeType: file.type || 'audio/mpeg',
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
  };

  await withStore('readwrite', (store) => store.put(record));

  return {
    id: record.id,
    name: record.name,
    mimeType: record.mimeType,
    size: record.size,
    blobUrl: URL.createObjectURL(file),
    createdAt: record.createdAt,
  };
}

/**
 * Retrieve all stored custom sounds (metadata only, no blobs).
 * @returns {Promise<Array<{ id, name, mimeType, size, blobUrl, createdAt }>>}
 */
export async function getAllCustomSounds() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result || [];
      const sounds = records.map((r) => ({
        id: r.id,
        name: r.name,
        mimeType: r.mimeType,
        size: r.size,
        blobUrl: URL.createObjectURL(r.blob),
        createdAt: r.createdAt,
      }));
      resolve(sounds);
    };

    request.onerror = () => reject(new Error('Failed to retrieve custom sounds.'));
  });
}

/**
 * Get a single custom sound by id and return a fresh Blob URL.
 * @param {string} id
 * @returns {Promise<{ id, name, mimeType, blobUrl } | null>}
 */
export async function getCustomSoundById(id) {
  const record = await withStore('readonly', (store) => store.get(id));
  if (!record) return null;
  return {
    id: record.id,
    name: record.name,
    mimeType: record.mimeType,
    blobUrl: URL.createObjectURL(record.blob),
    createdAt: record.createdAt,
  };
}

/**
 * Delete a custom sound from IndexedDB by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteCustomSound(id) {
  await withStore('readwrite', (store) => store.delete(id));
}

/**
 * Delete all custom sounds from IndexedDB.
 * @returns {Promise<void>}
 */
export async function clearAllCustomSounds() {
  await withStore('readwrite', (store) => store.clear());
}

/**
 * Count the number of stored sounds.
 * @returns {Promise<number>}
 */
export async function countCustomSounds() {
  return withStore('readonly', (store) => store.count());
}

/**
 * Check whether IndexedDB is available in this browser.
 * @returns {boolean}
 */
export function isIndexedDBSupported() {
  return typeof window !== 'undefined' && !!window.indexedDB;
}
