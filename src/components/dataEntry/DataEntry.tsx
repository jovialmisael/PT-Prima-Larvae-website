import { useEffect, useMemo, useState } from 'react';
import { Category, Division, SectionId } from '@domainTypes/index';
import { CATEGORIES, SECTION_ORDER } from '@utils/schema';
import { currentUser, currentRole, currentArea } from '@services/session';
import { canInput, categoryVisible } from '@services/rolesConfig';
import { CategoryPicker } from './CategoryPicker';
import { FormPanel } from './FormPanel';
import { StackedFormList } from './StackedFormList';
import { DataEntryModals } from './DataEntryModals';
import { deriveStatuses, DRAFT_PREFIX, type FormStatus } from './formStatus';
import { turunkanTugas, tanggalLokal, type Tugas } from '@services/tugas';
import { list } from '@services/api';
import { muatBakAktif } from '@services/bakAktif';
import { muatJadwal } from '@services/jadwalBerkala';
import { muatUmurPakai } from '@services/umurPakai';
import { susunPengingat, type Pengingat } from '@services/pengingat';
import { useEntrySubmit } from './useEntrySubmit';
import { FileText } from 'lucide-react';
import './dataEntry.css';

interface DataEntryProps {
  division: Division;
  title: string;
  subtitle: string;
  initialCategoryId?: string; // deep-link: langsung buka form kategori ini (lewati picker)
  initialSection?: string;    // deep-link: batasi picker ke satu bagian/judul (§01..§13)
}

/**
 * Kontainer data-entry schema-driven: filter kategori sesuai izin role/divisi,
 * merender formulir lewat FormPanel, dan submit
 * (validate → simpan draft) lewat useEntrySubmit.
 */
export function DataEntry({ division, title, subtitle, initialCategoryId, initialSection }: DataEntryProps) {
  const user = currentUser();
  const role = currentRole();
  const area = currentArea();

  const [activeId, setActiveId] = useState<string | null>(initialCategoryId ?? null);
  const [formKey, setFormKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [statusById, setStatusById] = useState<Record<string, FormStatus>>({});
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [pengingat, setPengingat] = useState<Pengingat[]>([]);
  const [statusRefresh, setStatusRefresh] = useState(0);

  useEffect(() => {
    setActiveId(initialCategoryId ?? null);
    setErrorMsg('');
  }, [initialCategoryId, initialSection]);

  const allMine = useMemo(() => {
    if (!role) return [] as Category[];
    return CATEGORIES.filter(
      c => c.division === division && categoryVisible(role, c, area) && canInput(role, c, area)
        && (!initialSection || c.section === initialSection)
    );
  }, [role, area, division, initialSection]);

  const filteredCategories = useMemo(() => {
    return allMine.filter(c => {
      const matchSearch =
        searchQuery.trim() === '' ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.frekuensi && c.frekuensi.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSection = selectedSection === 'all' || c.section === selectedSection;
      return matchSearch && matchSection;
    });
  }, [allMine, searchQuery, selectedSection]);

  const grouped = useMemo(() => {
    const bySection = new Map<SectionId, Category[]>();
    filteredCategories.forEach(c => {
      if (!c.section) return;
      if (!bySection.has(c.section)) bySection.set(c.section, []);
      bySection.get(c.section)!.push(c);
    });
    return SECTION_ORDER.filter(s => bySection.has(s)).map(s => ({ section: s, categories: bySection.get(s)! }));
  }, [filteredCategories]);

  const active = allMine.find(c => c.id === activeId) ?? null;

  const { submitting, pendingSave, setPendingSave, handleSubmit } = useEntrySubmit({
    active,
    userId: user?.userId ?? '',
    division,
    onSuccess: setSuccessMsg,
    onError: setErrorMsg,
    onSaved: () => { setStatusRefresh(n => n + 1); setFormKey(k => k + 1); },
  });

  // Status pengisian per kategori (dari record + draft lokal).
  useEffect(() => {
    let alive = true;
    deriveStatuses(allMine).then(m => { if (alive) setStatusById(m); });
    return () => { alive = false; };
  }, [allMine, statusRefresh]);

  // Tugas terjadwal hari ini, diturunkan dari kadens tiap kategori. Sengaja
  // tidak bergantung pada statusById: tugas harus tetap muncul justru ketika
  // belum ada record sama sekali.
  useEffect(() => {
    let alive = true;
    Promise.all([list('records'), muatBakAktif(), muatJadwal(), list('siklus'), muatUmurPakai()])
      .then(([records, bak, jadwal, siklus, umurPakai]) => {
        if (!alive) return;
        const daftar = turunkanTugas({ categories: allMine, records, tanggal: tanggalLokal(), bak, jadwal });
        setTugas(daftar);
        setPengingat(susunPengingat({
          siklus, records, umurPakai, jadwal, tugas: daftar,
          judulKategori: Object.fromEntries(CATEGORIES.map(c => [c.id, c.title])),
        }));
      });
    return () => { alive = false; };
  }, [allMine, statusRefresh]);

  if (!user || !role) {
    return (
      <div className="entry-empty-container">
        <FileText className="entry-empty-icon" />
        <h2 className="entry-empty-title">Akses Dibatasi</h2>
        <p className="entry-empty-text">Harap masuk terlebih dahulu untuk mengakses formulir input data.</p>
      </div>
    );
  }

  const goBack = () => { setActiveId(null); setErrorMsg(''); };

  return (
    <div className="entry-page">
      {!active ? (
        initialSection ? (
          <StackedFormList
            categories={grouped[0]?.categories ?? []}
            division={division}
            section={initialSection as SectionId}
          />
        ) : (
          <CategoryPicker
            division={division}
            area={area}
            title={title}
            subtitle={subtitle}
            roleTitle={role.title}
            allMine={allMine}
            grouped={grouped}
            statusById={statusById}
            tugas={tugas}
            pengingat={pengingat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sectionMode={false}
            onPick={id => { setActiveId(id); setErrorMsg(''); }}
          />
        )
      ) : (
        <FormPanel
          active={active}
          errorMsg={errorMsg || null}
          submitting={submitting}
          formKey={formKey}
          draftKey={DRAFT_PREFIX + active.id}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}

      <DataEntryModals
        successMsg={successMsg}
        onSuccessConfirm={() => setSuccessMsg(null)}
        onSuccessCancel={() => { setSuccessMsg(null); setActiveId(null); }}
        pending={pendingSave}
        onAbnormalConfirm={() => { pendingSave?.commit(); setPendingSave(null); }}
        onAbnormalCancel={() => setPendingSave(null)}
      />
    </div>
  );
}
