import { useState, useEffect } from 'react';
import { Clock, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import useTaskStore from '../../../stores/taskStore';
import { createTimeLog } from '../../../services/timeLogService';
import { formatMinutes } from '../../../utils/timeFormatters';

/**
 * ManualLogModal — Modal dialog for back-filling and logging historical time entries.
 * Harmonized for light and dark theme.
 *
 * Props:
 *  isOpen    — Boolean controlling visibility
 *  onClose   — Callback to close modal
 *  onSuccess — Optional callback upon successful creation
 */
export default function ManualLogModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialStartTime,
}) {
  const { tasks, categories, loadTasks } = useTaskStore();

  const getTodayDateString = () => new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [taskId, setTaskId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [logType, setLogType] = useState('manual');
  const [notes, setNotes] = useState('');

  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      const activeDate = initialDate || getTodayDateString();
      const activeStart = initialStartTime || '09:00';
      setDate(activeDate);
      setStartTime(activeStart);

      // Compute end time +1 hour by default
      const [h, m] = activeStart.split(':').map(Number);
      const endH = (h + 1) % 24;
      const pad = (n) => String(n).padStart(2, '0');
      setEndTime(`${pad(endH)}:${pad(m)}`);
    }
  }, [isOpen, initialDate, initialStartTime]);

  // Auto-calculate duration whenever startTime or endTime changes
  useEffect(() => {
    if (!startTime || !endTime) {
      setDurationMinutes(0);
      return;
    }

    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);

    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;

    if (endTotal >= startTotal) {
      setDurationMinutes(endTotal - startTotal);
      setError('');
    } else {
      setDurationMinutes(0);
      setError('End time must be after start time.');
    }
  }, [startTime, endTime]);

  // When task changes, auto-select its category if not already set
  const handleTaskChange = (selectedTaskId) => {
    setTaskId(selectedTaskId);
    if (selectedTaskId) {
      const selected = tasks.find((t) => t._id === selectedTaskId);
      if (selected?.categoryId?._id) {
        setCategoryId(selected.categoryId._id);
      } else if (selected?.categoryId) {
        setCategoryId(selected.categoryId);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (durationMinutes <= 0) {
      setError('Duration must be greater than 0 minutes.');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Invalid date or time.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createTimeLog({
        taskId: taskId || null,
        categoryId: categoryId || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        durationMinutes,
        logType,
        notes: notes.trim(),
      });

      // Reload tasks so actualMinutes updates
      await loadTasks();

      setSuccessMessage('Time logged successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save time entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Time Manually" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-danger-500/10 border border-danger-500/30 text-danger-600 dark:text-danger-400 text-sm shadow-warm-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-pastel-matcha-light/50 dark:bg-success-500/10 border border-pastel-matcha/40 text-pastel-matcha-dark dark:text-success-400 text-sm flex items-center gap-2 font-bold shadow-warm-sm">
            <CheckCircle2 size={16} />
            {successMessage}
          </div>
        )}

        {/* Date Picker */}
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input cursor-pointer"
            required
          />
        </div>

        {/* Time Range: Start and End */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input cursor-pointer"
              required
            />
          </div>
          <div>
            <label className="label">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input cursor-pointer"
              required
            />
          </div>
        </div>

        {/* Calculated Duration Display */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-100 dark:bg-surface-850 border border-surface-200 dark:border-surface-700 shadow-warm-sm">
          <span className="text-xs text-surface-600 dark:text-surface-400 font-semibold flex items-center gap-1.5">
            <Clock size={14} className="text-primary-500" />
            Total Duration:
          </span>
          <span className="text-sm font-bold text-surface-900 dark:text-surface-100 font-mono">
            {formatMinutes(durationMinutes)} ({durationMinutes} min)
          </span>
        </div>

        {/* Task Selector */}
        <div>
          <label className="label">Link to Task (Optional)</label>
          <select
            value={taskId}
            onChange={(e) => handleTaskChange(e.target.value)}
            className="input cursor-pointer"
          >
            <option value="">No task linked</option>
            {tasks.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="label">Category (Optional)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input cursor-pointer"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Log Type */}
        <div>
          <label className="label">Log Type</label>
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="input cursor-pointer"
          >
            <option value="manual">Manual Entry</option>
            <option value="stopwatch">Stopwatch Session</option>
            <option value="pomodoro">Pomodoro Session</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you work on during this period?"
            rows={2}
            className="input resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-surface-200 dark:border-surface-700">
          <button type="button" onClick={onClose} className="btn-ghost text-xs py-2 px-3.5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || durationMinutes <= 0}
            className="btn-primary text-xs py-2 px-4 shadow-warm-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Plus size={14} /> Log Time
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
