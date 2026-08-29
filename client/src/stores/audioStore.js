import { create } from 'zustand';
import {
  saveCustomSound,
  getAllCustomSounds,
  deleteCustomSound,
  validateAudioFile,
  isIndexedDBSupported,
} from '../utils/audioStorage';
import { playCustomAudio, stopCustomAudio } from '../utils/audioLibrary';

/**
 * audioStore.js — Zustand store managing custom uploaded sound library.
 *
 * State:
 *   customSounds    — Array of { id, name, mimeType, size, blobUrl, createdAt }
 *   isLoading       — Loading spinner flag during async operations
 *   isUploading     — Flag while a file is being processed and stored
 *   uploadError     — Validation or storage error message
 *   previewingId    — ID of the sound currently being previewed (null = none)
 *   activeAudioEl   — The HTMLAudioElement used for preview playback
 *   isSupported     — Whether IndexedDB is available in this browser
 *
 * Actions:
 *   loadSounds()            — Load all sounds from IndexedDB
 *   uploadSound(file)       — Validate, store, and append new sound to list
 *   removeSound(id)         — Delete a sound from IndexedDB and state
 *   previewSound(id, vol)   — Play a custom sound by ID for preview
 *   stopPreview()           — Stop the currently previewing sound
 *   clearError()            — Reset uploadError message
 */
const useAudioStore = create((set, get) => ({
  customSounds: [],
  isLoading: false,
  isUploading: false,
  uploadError: null,
  previewingId: null,
  activeAudioEl: null,
  isSupported: isIndexedDBSupported(),

  // ── Load all stored custom sounds from IndexedDB on init ────────────────
  loadSounds: async () => {
    if (!isIndexedDBSupported()) {
      set({ isSupported: false });
      return;
    }

    set({ isLoading: true });
    try {
      const sounds = await getAllCustomSounds();
      set({ customSounds: sounds, isLoading: false });
    } catch (err) {
      console.error('[audioStore] Failed to load sounds:', err);
      set({ isLoading: false });
    }
  },

  // ── Validate, store, and append a new uploaded audio file ───────────────
  uploadSound: async (file) => {
    // Client-side validation first
    const { valid, error } = validateAudioFile(file);
    if (!valid) {
      set({ uploadError: error });
      return null;
    }

    set({ isUploading: true, uploadError: null });
    try {
      const stored = await saveCustomSound(file);

      set((state) => ({
        customSounds: [...state.customSounds, stored],
        isUploading: false,
      }));

      return stored;
    } catch (err) {
      console.error('[audioStore] Upload failed:', err);
      set({ isUploading: false, uploadError: err.message || 'Upload failed.' });
      return null;
    }
  },

  // ── Remove a sound from both IndexedDB and local state ──────────────────
  removeSound: async (id) => {
    const { stopPreview, previewingId } = get();

    // Stop preview if we're deleting the currently previewing sound
    if (previewingId === id) {
      stopPreview();
    }

    try {
      await deleteCustomSound(id);
      set((state) => ({
        customSounds: state.customSounds.filter((s) => s.id !== id),
      }));
    } catch (err) {
      console.error('[audioStore] Failed to delete sound:', err);
    }
  },

  // ── Preview a custom sound by ID ─────────────────────────────────────────
  previewSound: (id, volume = 0.8) => {
    const { customSounds, stopPreview } = get();

    // Stop any current preview first
    stopPreview();

    const sound = customSounds.find((s) => s.id === id);
    if (!sound) return;

    const audioEl = playCustomAudio(sound.blobUrl, volume);

    // Auto-clear state after playback ends
    if (audioEl) {
      audioEl.addEventListener('ended', () => {
        set({ previewingId: null, activeAudioEl: null });
      });
    }

    set({ previewingId: id, activeAudioEl: audioEl });
  },

  // ── Stop the currently previewing sound ──────────────────────────────────
  stopPreview: () => {
    const { activeAudioEl } = get();
    if (activeAudioEl) {
      stopCustomAudio(activeAudioEl);
    }
    set({ previewingId: null, activeAudioEl: null });
  },

  // ── Clear upload error message ────────────────────────────────────────────
  clearError: () => set({ uploadError: null }),
}));

export default useAudioStore;
