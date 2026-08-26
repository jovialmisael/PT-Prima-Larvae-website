import { SectionId } from '@domainTypes/index';
import {
  Layers, FlaskConical, Waves, FileText,
  Droplets, Microscope, Activity, AlertTriangle, Ruler, ShieldCheck, PackageCheck, ClipboardList,
} from 'lucide-react';

// Ikon per-bagian (section) untuk header grup & chip di picker.
export function getSectionIcon(section?: SectionId) {
  switch (section) {
    case '01': return <Layers className="entry-card-icon" />;
    case '02': return <Waves className="entry-card-icon" />;
    case '03': return <FlaskConical className="entry-card-icon" />;
    case '04': return <Droplets className="entry-card-icon" />;
    case '05': return <Microscope className="entry-card-icon" />;
    case '06': return <Activity className="entry-card-icon" />;
    case '07': return <AlertTriangle className="entry-card-icon" />;
    case '08': return <Ruler className="entry-card-icon" />;
    case '09': return <ShieldCheck className="entry-card-icon" />;
    case '10': return <PackageCheck className="entry-card-icon" />;
    case '12': return <ClipboardList className="entry-card-icon" />;
    default: return <FileText className="entry-card-icon" />;
  }
}
