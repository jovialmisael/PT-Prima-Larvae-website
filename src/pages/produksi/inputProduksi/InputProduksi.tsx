import { useSearchParams, Navigate } from 'react-router-dom';
import { DataEntry } from '@components/dataEntry/DataEntry';
import { currentRole } from '@services/session';

export function InputProduksi() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category') ?? undefined;
  const section = searchParams.get('section') ?? undefined;
  const role = currentRole();

  // Role non-produksi (MPM, Lab, Manager, Owner) tidak mengisi formulir produksi harian
  if (role && (role.id === 'mpm' || role.id === 'manager' || role.id === 'owner' || role.division === 'lab')) {
    return <Navigate to={role.id === 'mpm' ? '/inbox-pengesahan' : '/'} replace />;
  }

  return (
    <DataEntry
      division="produksi"
      title="Input Data Produksi"
      subtitle="Pilih data operasional yang ingin dicatat."
      initialCategoryId={categoryId}
      initialSection={section}
    />
  );
}

