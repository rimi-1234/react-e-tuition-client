import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../providers/ThemeProvider';

const options = [
  { id: 'light', label: 'Light theme', icon: Sun },
  { id: 'dark', label: 'Dark theme', icon: Moon },
  { id: 'system', label: 'Use device theme', icon: Monitor },
];

const ThemeToggle = ({ className = '' }) => {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`join rounded-full border border-base-300 bg-base-100 ${className}`}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const selected = preference === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setPreference(option.id)}
            className={`btn btn-ghost btn-sm join-item flex-1 border-0 px-2.5 ${
              selected ? 'bg-primary text-white hover:bg-primary' : 'text-base-content'
            }`}
          >
            <Icon size={16} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
