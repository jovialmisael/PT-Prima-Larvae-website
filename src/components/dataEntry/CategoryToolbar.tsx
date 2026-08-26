import type { Category } from '@domainTypes/index';
import { SECTION_LABELS, SECTION_ORDER } from '@utils/schema';
import { Search, X, Filter } from 'lucide-react';

interface CategoryToolbarProps {
  allMine: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
}

/** Pencarian + chip filter per seksi. Dipisah agar CategoryPicker tetap ringkas. */
export function CategoryToolbar({
  allMine, searchQuery, setSearchQuery, selectedSection, setSelectedSection,
}: CategoryToolbarProps) {
  return (
    <div className="entry-toolbar">
      <div className="entry-search-box">
        <Search className="entry-search-icon" />
        <input
          type="text"
          className="entry-search-input"
          placeholder="Cari formulir atau parameter..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="entry-search-clear"
            onClick={() => setSearchQuery('')}
            title="Hapus pencarian"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="entry-filter-chips">
        <button
          type="button"
          className={`entry-chip ${selectedSection === 'all' ? 'is-active' : ''}`}
          onClick={() => setSelectedSection('all')}
        >
          <Filter className="entry-chip-icon" />
          Semua ({allMine.length})
        </button>

        {SECTION_ORDER.map(s => {
          const count = allMine.filter(c => c.section === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              type="button"
              className={`entry-chip ${selectedSection === s ? 'is-active' : ''}`}
              onClick={() => setSelectedSection(s)}
            >
              {SECTION_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
