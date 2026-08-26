import { Category, Division, SectionId, Area } from '@domainTypes/index';
import { SECTION_LABELS } from '@utils/schema';
import { Card, CardBody } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { getSectionIcon } from './domainIcons';
import { STATUS_META, type FormStatus } from './formStatus';
import { DailyTaskSummary } from './DailyTaskSummary';
import type { Tugas } from '@services/tugas';
import type { Pengingat } from '@services/pengingat';
import { PanelPengingat } from './PanelPengingat';
import { CategoryToolbar } from './CategoryToolbar';
import { Search, FileText, ChevronRight, CheckCircle2, Clock, Activity } from 'lucide-react';

interface CategoryPickerProps {
  division: Division;
  area?: Area;
  title: string;
  subtitle: string;
  roleTitle: string;
  allMine: Category[];
  grouped: { section: SectionId; categories: Category[] }[];
  statusById: Record<string, FormStatus>;
  tugas: Tugas[];
  pengingat: Pengingat[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSection: string;
  setSelectedSection: (s: string) => void;
  sectionMode: boolean;
  onPick: (id: string) => void;
}

const CTA_LABEL: Record<FormStatus, string> = {
  belum: 'Mulai Isi →',
  draft: 'Lanjutkan →',
  sebagian: 'Lanjutkan →',
  lengkap: 'Tinjau & Kirim →',
  revisi: 'Perbaiki →',
  qc: 'Lihat →',
  disahkan: 'Lihat →',
};

function CategoryCard({ c, status, onPick }: { c: Category; status: FormStatus; onPick: (id: string) => void }) {
  const isDone = status === 'lengkap' || status === 'disahkan';
  return (
    <button type="button" className={`entry-card ${isDone ? 'is-done' : ''}`} onClick={() => onPick(c.id)}>
      <div className="entry-card-header-row">
        {c.frekuensi ? (
          <span className="entry-card-freq"><Clock size={12} />{c.frekuensi}</span>
        ) : <span />}
        <Badge status={STATUS_META[status].tone}>{STATUS_META[status].label}</Badge>
      </div>
      <h3 className="entry-card-title">
        {isDone && <CheckCircle2 size={16} className="text-primary" />}
        {c.title}
      </h3>
      <div className="entry-card-footer">
        <span className="entry-card-field-count"><Activity size={12} /> {c.fields.length} parameter isian</span>
        <span className="entry-card-action">{CTA_LABEL[status]}</span>
      </div>
    </button>
  );
}

export function CategoryPicker({
  division,
  roleTitle,
  allMine,
  grouped,
  statusById,
  tugas,
  pengingat,
  searchQuery,
  setSearchQuery,
  selectedSection,
  setSelectedSection,
  sectionMode,
  onPick
}: CategoryPickerProps) {
  // Mode section (dibuka dari judul sidebar): tampilan bersih — tanpa dashboard & chip.
  if (sectionMode) {
    const sectionLabel = grouped[0] ? SECTION_LABELS[grouped[0].section] : 'Bagian';
    return (
      <>
        <div className="catalog-divider-header">
          <div>
            <div className="entry-breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Input Data Harian</span>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{sectionLabel}</span>
            </div>
          </div>
        </div>

        {allMine.length === 0 ? (
          <Card>
            <CardBody>
              <div className="entry-empty-state">
                <FileText className="entry-empty-icon" />
                <h3>Tidak Ada Formulir</h3>
                <p>Peran Anda ({roleTitle}) tidak memiliki parameter untuk diisi pada bagian ini.</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="entry-grid">
            {grouped.flatMap(g => g.categories).map(c => (
              <CategoryCard key={c.id} c={c} status={statusById[c.id] ?? 'belum'} onPick={onPick} />
            ))}
          </div>
        )}
      </>
    );
  }

  // Mode katalog penuh: dashboard + toolbar + kartu dikelompokkan per SECTION.
  return (
    <>
      <PanelPengingat pengingat={pengingat} onPickCategory={onPick} />

      <DailyTaskSummary
        division={division}
        tugas={tugas}
        onPickCategory={onPick}
      />

      <div className="catalog-divider-header">
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Daftar Formulir
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Kerjakan form pengisian data sesuai urutan prioritas atau gunakan pencarian.
          </p>
        </div>
        <span className="count-badge font-mono">{allMine.length} formulir</span>
      </div>

      <CategoryToolbar
        allMine={allMine}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
      />
      {allMine.length === 0 ? (
        <Card>
          <CardBody>
            <div className="entry-empty-state">
              <FileText className="entry-empty-icon" />
              <h3>Tidak Ada Formulir untuk Peran Ini</h3>
              <p>Peran Anda ({roleTitle}) tidak memiliki izin pengisian formulir di divisi ini.</p>
            </div>
          </CardBody>
        </Card>
      ) : grouped.length === 0 ? (
        <div className="entry-no-results">
          <Search className="entry-no-results-icon" />
          <h3>Formulir Tidak Ditemukan</h3>
          <p>Tidak ada formulir yang cocok dengan kata kunci "{searchQuery}".</p>
          <button
            type="button"
            className="ui-btn ui-btn-secondary ui-btn-sm"
            onClick={() => { setSearchQuery(''); setSelectedSection('all'); }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="entry-groups">
          {grouped.map(({ section, categories }) => (
            <section key={section} className="entry-group-section">
              <div className="entry-group-header">
                <div className="entry-group-header-left">
                  <span className="entry-group-icon-wrap">{getSectionIcon(section)}</span>
                  <h2 className="entry-group-title">{SECTION_LABELS[section]}</h2>
                </div>
                <span className="entry-group-count">{categories.length} formulir</span>
              </div>

              <div className="entry-grid">
                {categories.map(c => (
                  <CategoryCard key={c.id} c={c} status={statusById[c.id] ?? 'belum'} onPick={onPick} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
