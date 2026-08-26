import { useSearchParams, Navigate } from 'react-router-dom';
import { DataEntry } from '@components/dataEntry/DataEntry';
import { currentRole } from '@services/session';

export function InputLab() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ?? undefined;
  const section = searchParams.get('section') ?? undefined;
  const role = currentRole();

  // Role non-lab (Produksi, MPM, Manager, Owner) tidak mengisi formulir lab harian
  if (role && (role.id === 'mpm' || role.id === 'manager' || role.id === 'owner' || role.division === 'produksi')) {
    return <Navigate to={role.id === 'mpm' ? '/inbox-pengesahan' : '/'} replace />;
  }

  return (
    <DataEntry
      division="lab"
      title="Input Data Laboratorium"
      subtitle="Analisis & mutu sesuai area: kimia air, mikrobiologi, mutu naupli/PL, dan algae."
      initialCategoryId={categoryId}
      initialSection={section}
    />
  );
}

