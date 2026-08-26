import { Search } from 'lucide-react';

interface AlertCenterFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTingkat: string;
  setSelectedTingkat: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
}

export function AlertCenterFilters({
  searchQuery,
  setSearchQuery,
  selectedTingkat,
  setSelectedTingkat,
  selectedStatus,
  setSelectedStatus,
}: AlertCenterFiltersProps) {
  return (
    <div className="alert-filter-bar">
      <div className="alert-search-box">
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari bak, parameter, atau pesan alert..."
          className="alert-search-input"
        />
      </div>

      <div className="alert-filter-groups">
        <div>
          <select
            value={selectedTingkat}
            onChange={(e) => setSelectedTingkat(e.target.value)}
            className="filter-select"
          >
            <option value="semua">Tingkat: Semua</option>
            <option value="bahaya">Bahaya (Kritis)</option>
            <option value="waspada">Waspada</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="semua">Status: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="diakui">Diakui</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>
    </div>
  );
}
