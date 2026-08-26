import { RoleIcon } from './LoginIcons';
import type { RolePreset } from './loginPresets';

interface LoginRolePresetsProps {
  presets: RolePreset[];
  activeUsername: string;
  onSelectRole: (username: string) => void;
}

export function LoginRolePresets({ presets, activeUsername, onSelectRole }: LoginRolePresetsProps) {
  return (
    <div className="quick-roles-container">
      <div className="quick-roles-header">
        <span className="quick-roles-title">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Isi Cepat Peran Simulasi:
        </span>
      </div>
      <div className="quick-chips-wrapper">
        {presets.map((preset) => (
          <button
            key={preset.username}
            type="button"
            onClick={() => onSelectRole(preset.username)}
            className={`role-chip-btn ${activeUsername === preset.username ? 'active' : ''}`}
            title={`Masuk sebagai ${preset.title}`}
          >
            <span className="role-chip-icon" style={{ color: preset.color }}>
              <RoleIcon type={preset.iconKey} />
            </span>
            <span>{preset.badge}</span>
            {preset.area && <span className="role-chip-area">{preset.area}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
