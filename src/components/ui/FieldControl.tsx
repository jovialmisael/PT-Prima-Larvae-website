import { useState } from 'react';
import { FieldDef } from '@domainTypes/index';
import { evalField } from '@services/alerts';
import { PCR_OPTIONS, GLOSSARY } from '@utils/schema';
import { Badge } from './Badge';
import { Calculator, AlertTriangle, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';

export type RefOption = { value: string; label: string };

interface FieldControlProps {
  field: FieldDef;
  value: any;
  allValues: Record<string, any>;
  computedValue?: any;
  refOptions?: RefOption[];
  onChange: (val: any) => void;
}

/**
 * Satu kontrol input yang dirender dari sebuah FieldDef. Mendukung tipe
 * computed / select / pcr / ref / textarea / text|number|date, lengkap dengan
 * hint (glosarium), pewarnaan ambang, dan alert realtime waspada/bahaya.
 *
 * Seluruh tipe memakai satu sistem kelas token (`ui-*`) supaya tinggi label dan
 * kontrol seragam — kalau tipe dicampur dalam satu baris grid, isian tetap
 * sejajar dan badge satuan tidak pernah menimpa label.
 */
export function FieldControl({ field, value, allValues, computedValue, refOptions, onChange }: FieldControlProps) {
  const [showHint, setShowHint] = useState(false);

  const filled = value !== undefined && value !== null && value !== '';
  // Ambang stage-aware: pakai nilai field `stadia` di form yang sama bila ada.
  const stadiaCtx = allValues?.stadia;
  const status = field.threshold && filled ? evalField(value, field.threshold, stadiaCtx) : 'normal';
  const showStatus = status !== 'normal';

  // `hint` boleh berisi kunci glosarium (mis. hint: 'TAN') atau teks bebas.
  // Kunci dicari dulu supaya penjelasan panjangnya yang tampil, bukan singkatannya.
  const hintText = (field.hint && (GLOSSARY[field.hint] || field.hint)) || GLOSSARY[field.key] || null;

  const labelNode = (
    <div className="ui-label-row">
      <label className="ui-label" htmlFor={field.key}>
        {field.label}
        {field.required && <span className="ui-required" title="Wajib diisi"> *</span>}
      </label>
      {hintText && (
        <button
          type="button"
          className="ui-hint-btn"
          onClick={() => setShowHint(!showHint)}
          title="Petunjuk parameter"
        >
          <HelpCircle size={14} />
        </button>
      )}
    </div>
  );

  const hintNode = hintText && showHint ? <div className="ui-hint-box">{hintText}</div> : null;

  // 1. Tipe Computed (Kalkulasi Otomatis)
  if (field.type === 'computed') {
    const display =
      computedValue == null
        ? '—'
        : typeof computedValue === 'number'
          ? computedValue.toFixed(field.precision ?? 2)
          : String(computedValue);

    return (
      <div className="ui-input-wrapper ui-input-wrapper-computed">
        {labelNode}
        <div className="ui-computed-box">
          <div className="ui-computed-value-row">
            <Calculator className="ui-computed-icon" />
            <span className="ui-computed-value font-mono">{display}</span>
            {field.unit && <span className="ui-computed-unit">{field.unit}</span>}
          </div>
          <span className="ui-computed-tag">Otomatis</span>
        </div>
        {hintNode}
      </div>
    );
  }

  const selectClass = `ui-input ui-select ${showStatus ? `ui-input-${status}` : ''}`;

  let control: React.ReactNode;
  if (field.type === 'select') {
    // 2. Tipe Select / Options
    control = (
      <div className="ui-select-wrap">
        <select id={field.key} className={selectClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          <option value="">— Pilih {field.label} —</option>
          {field.options?.map(o => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="ui-select-chevron" />
      </div>
    );
  } else if (field.type === 'segmented') {
    // 2.5 Tipe Segmented (Tombol Horizontal)
    control = (
      <div className="ui-segmented-control" role="radiogroup" aria-label={field.label}>
        {field.options?.map(o => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            className={`ui-segmented-btn ${value === o ? 'ui-segmented-btn-active' : ''}`}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    );
  } else if (field.type === 'pcr') {
    // 3. Tipe PCR (Standard PCR Options)
    const options = field.options || PCR_OPTIONS;
    control = (
      <div className="ui-select-wrap">
        <select id={field.key} className={selectClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          <option value="">— Pilih Hasil PCR —</option>
          {options.map(o => (
            <option key={o} value={o}>
              {o.toUpperCase()}
            </option>
          ))}
        </select>
        <ChevronDown className="ui-select-chevron" />
      </div>
    );
  } else if (field.type === 'ref') {
    // 4. Tipe Ref (Pilihan data Master)
    control = (
      <div className="ui-select-wrap">
        <select id={field.key} className={selectClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
          <option value="">{refOptions ? `— Pilih ${field.label} —` : 'Memuat data master…'}</option>
          {refOptions?.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="ui-select-chevron" />
      </div>
    );
  } else if (field.type === 'textarea') {
    // 5. Tipe Textarea
    control = (
      <textarea
        id={field.key}
        className="ui-input ui-textarea"
        rows={3}
        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    );
  } else {
    // 6. Tipe Text | Number | Date
    // Badge satuan dipasang relatif terhadap pembungkus input, bukan terhadap
    // seluruh field — label yang turun ke dua baris tidak menggeser posisinya.
    control = (
      <div className={`ui-input-control-wrap ${field.unit ? 'has-unit' : ''}`}>
        <input
          id={field.key}
          className={`ui-input ${showStatus ? `ui-input-${status}` : ''}`}
          type={field.type}
          step={field.type === 'number' ? 'any' : undefined}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          placeholder={field.type === 'date' ? undefined : `Isi ${field.label.toLowerCase()}`}
          value={value ?? ''}
          onChange={e =>
            onChange(
              field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
            )
          }
        />
        {field.unit && <span className="ui-input-unit-badge">{field.unit}</span>}
      </div>
    );
  }

  return (
    <div className={`ui-input-wrapper ${showStatus ? `is-${status}` : ''}`}>
      {labelNode}
      {control}
      {hintNode}

      {showStatus && (
        <div className={`ui-field-alert ui-field-alert-${status}`}>
          {status === 'bahaya' ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
          <span>
            {status === 'bahaya' ? 'Nilai Melewati Batas Bahaya' : 'Perhatian: Mendekati Batas Kritis'}
          </span>
          <Badge status={status}>{status === 'bahaya' ? 'Bahaya' : 'Waspada'}</Badge>
        </div>
      )}
    </div>
  );
}
