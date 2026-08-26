import { useEffect, useState } from 'react';
import { saveDraft, loadDraft } from '@services/api';

/**
 * State nilai form + autosave draft (debounce) bila `draftKey` di-set.
 * Memuat draft saat mount dan menyimpan otomatis setiap perubahan.
 */
export function useDraftAutosave(draftKey?: string) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!draftKey) { setLoaded(true); return; }
    let active = true;
    loadDraft(draftKey).then(d => {
      if (active && d && typeof d === 'object') setValues(d);
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey || !loaded) return;
    if (Object.keys(values).length === 0) return; // jangan simpan draft kosong
    const id = setTimeout(async () => {
      await saveDraft(draftKey, values);
      setLastSaved(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    }, 800);
    return () => clearTimeout(id);
  }, [values, draftKey, loaded]);

  return { values, setValues, lastSaved };
}
