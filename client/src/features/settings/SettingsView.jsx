import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Clock,
  Palette,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';

/**
 * SettingsView — User preferences and configuration for timers, themes, and profile.
 */
export default function SettingsView() {
  const { user, updatePreferences, updateProfile, isLoading } = useAuthStore();

  const userPrefs = user?.preferences || {};

  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [dailyGoalHours, setDailyGoalHours] = useState(userPrefs.dailyGoalHours ?? 8);
  const [pomodoroWorkMinutes, setPomodoroWorkMinutes] = useState(userPrefs.pomodoroWorkMinutes ?? 25);
  const [pomodoroShortBreakMinutes, setPomodoroShortBreakMinutes] = useState(userPrefs.pomodoroShortBreakMinutes ?? 5);
  const [pomodoroLongBreakMinutes, setPomodoroLongBreakMinutes] = useState(userPrefs.pomodoroLongBreakMinutes ?? 15);
  const [longBreakInterval, setLongBreakInterval] = useState(userPrefs.longBreakInterval ?? 4);
  const [theme, setTheme] = useState(userPrefs.theme || 'dark');
  const [soundEnabled, setSoundEnabled] = useState(userPrefs.soundEnabled ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      const p = user.preferences || {};
      setDailyGoalHours(p.dailyGoalHours ?? 8);
      setPomodoroWorkMinutes(p.pomodoroWorkMinutes ?? 25);
      setPomodoroShortBreakMinutes(p.pomodoroShortBreakMinutes ?? 5);
      setPomodoroLongBreakMinutes(p.pomodoroLongBreakMinutes ?? 15);
      setLongBreakInterval(p.longBreakInterval ?? 4);
      setTheme(p.theme || 'dark');
      setSoundEnabled(p.soundEnabled ?? true);
    }
  }, [user]);

  // Handle immediate theme switch preview
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleResetDefaults = () => {
    setDailyGoalHours(8);
    setPomodoroWorkMinutes(25);
    setPomodoroShortBreakMinutes(5);
    setPomodoroLongBreakMinutes(15);
    setLongBreakInterval(4);
    setTheme('dark');
    setSoundEnabled(true);
    document.documentElement.classList.add('dark');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedbackMsg('');
    setErrorMsg('');

    try {
      // 1. Update Profile if username changed
      if (username.trim() && username.trim() !== user?.username) {
        await updateProfile({ username: username.trim() });
      }

      // 2. Update Preferences
      await updatePreferences({
        dailyGoalHours: Number(dailyGoalHours),
        pomodoroWorkMinutes: Number(pomodoroWorkMinutes),
        pomodoroShortBreakMinutes: Number(pomodoroShortBreakMinutes),
        pomodoroLongBreakMinutes: Number(pomodoroLongBreakMinutes),
        longBreakInterval: Number(longBreakInterval),
        theme,
        soundEnabled: Boolean(soundEnabled),
      });

      setFeedbackMsg('Preferences and settings updated successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="border-b border-surface-800 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-surface-100 flex items-center gap-2">
          <Settings size={24} className="text-primary-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-surface-400 mt-0.5">
          Customize your Pomodoro durations, daily focus goals, notification alerts, and theme.
        </p>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-success-500/10 border border-success-500/30 text-success-400 text-sm flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 size={16} />
          {feedbackMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm animate-fade-in">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Profile Information ─────────────────────────────── */}
        <div className="card p-5 bg-surface-800 border-surface-700 space-y-4">
          <h2 className="text-sm font-semibold text-surface-100 flex items-center gap-2 pb-2 border-b border-surface-700/60">
            <User size={16} className="text-primary-400" />
            Profile Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email Address (Read-only)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-surface-900/50 text-surface-500 cursor-not-allowed border-surface-800"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Pomodoro & Focus Timers ──────────────────────────── */}
        <div className="card p-5 bg-surface-800 border-surface-700 space-y-5">
          <h2 className="text-sm font-semibold text-surface-100 flex items-center gap-2 pb-2 border-b border-surface-700/60">
            <Clock size={16} className="text-primary-400" />
            Timer & Focus Durations
          </h2>

          {/* Daily Goal Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="label mb-0">Daily Focus Goal (Hours)</label>
              <span className="text-xs font-mono font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                {dailyGoalHours} hrs / day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              step="1"
              value={dailyGoalHours}
              onChange={(e) => setDailyGoalHours(Number(e.target.value))}
              className="w-full accent-primary-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-surface-500">
              <span>1 hr</span>
              <span>8 hrs (Recommended)</span>
              <span>16 hrs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Work Duration */}
            <div>
              <label className="label">Focus Work (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={pomodoroWorkMinutes}
                onChange={(e) => setPomodoroWorkMinutes(Number(e.target.value))}
                className="input"
                required
              />
              <p className="text-[10px] text-surface-500 mt-1">Default: 25 minutes</p>
            </div>

            {/* Short Break */}
            <div>
              <label className="label">Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={pomodoroShortBreakMinutes}
                onChange={(e) => setPomodoroShortBreakMinutes(Number(e.target.value))}
                className="input"
                required
              />
              <p className="text-[10px] text-surface-500 mt-1">Default: 5 minutes</p>
            </div>

            {/* Long Break */}
            <div>
              <label className="label">Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={pomodoroLongBreakMinutes}
                onChange={(e) => setPomodoroLongBreakMinutes(Number(e.target.value))}
                className="input"
                required
              />
              <p className="text-[10px] text-surface-500 mt-1">Default: 15 minutes</p>
            </div>
          </div>

          {/* Long Break Interval */}
          <div className="max-w-xs">
            <label className="label">Long Break Interval (Cycles)</label>
            <input
              type="number"
              min="2"
              max="10"
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(Number(e.target.value))}
              className="input"
              required
            />
            <p className="text-[10px] text-surface-500 mt-1">
              Trigger long break every {longBreakInterval} work sessions.
            </p>
          </div>
        </div>

        {/* ── Section 3: Interface & Sound ───────────────────────────────── */}
        <div className="card p-5 bg-surface-800 border-surface-700 space-y-5">
          <h2 className="text-sm font-semibold text-surface-100 flex items-center gap-2 pb-2 border-b border-surface-700/60">
            <Palette size={16} className="text-primary-400" />
            Appearance & Audio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="label">Theme Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-primary-500/15 border-primary-500 text-primary-300 shadow-sm'
                      : 'bg-surface-850 border-surface-700 text-surface-400 hover:text-surface-200'
                  }`}
                >
                  <Moon size={15} />
                  Dark Theme
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-primary-500/15 border-primary-500 text-primary-300 shadow-sm'
                      : 'bg-surface-850 border-surface-700 text-surface-400 hover:text-surface-200'
                  }`}
                >
                  <Sun size={15} />
                  Light Theme
                </button>
              </div>
            </div>

            {/* Sound Alerts */}
            <div className="space-y-2">
              <label className="label">Completion Audio Alert</label>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                  soundEnabled
                    ? 'bg-success-500/10 border-success-500/30 text-success-300'
                    : 'bg-surface-850 border-surface-700 text-surface-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? <Volume2 size={16} className="text-success-400" /> : <VolumeX size={16} />}
                  <span>{soundEnabled ? 'Chime Sound Enabled' : 'Sound Muted'}</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider font-semibold">
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>
              <p className="text-[10px] text-surface-500">
                Plays a pleasant audio chime when Pomodoro sessions complete.
              </p>
            </div>
          </div>
        </div>

        {/* ── Action Buttons Footer ──────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn-ghost text-xs py-2 px-3 gap-1.5"
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="btn-primary py-2.5 px-5 gap-2 text-sm shadow-lg shadow-primary-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving Changes…
              </>
            ) : (
              <>
                <Save size={16} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
