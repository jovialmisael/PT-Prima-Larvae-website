import { AlertModal } from '@components/ui/AlertModal';

interface DataEntryModalsProps {
  successMsg: string | null;
  onSuccessConfirm: () => void;
  onSuccessCancel: () => void;
  pending: { abnormal: string[] } | null;
  onAbnormalConfirm: () => void;
  onAbnormalCancel: () => void;
}

/** Modal-modal DataEntry: sukses simpan draft + konfirmasi data abnormal. */
export function DataEntryModals({
  successMsg, onSuccessConfirm, onSuccessCancel,
  pending, onAbnormalConfirm, onAbnormalCancel,
}: DataEntryModalsProps) {
  return (
    <>
      <AlertModal
        isOpen={!!successMsg}
        title="Data Berhasil Disimpan"
        type="info"
        confirmLabel="Lanjut Mengisi"
        cancelLabel="Kembali ke Menu"
        onConfirm={onSuccessConfirm}
        onCancel={onSuccessCancel}
      >
        <p className="entry-success-modal-desc">{successMsg}</p>
      </AlertModal>

      <AlertModal
        isOpen={!!pending}
        title="Konfirmasi Data Abnormal"
        type="warning"
        confirmLabel="Ya, Simpan"
        cancelLabel="Periksa Lagi"
        onConfirm={onAbnormalConfirm}
        onCancel={onAbnormalCancel}
      >
        <p className="entry-success-modal-desc">
          {pending?.abnormal.length} parameter berada di zona bahaya. Data abnormal tetap penting
          dan akan disimpan sebagai draft. Pastikan pengamatan sudah benar sebelum melanjutkan.
        </p>
        <ul className="entry-abnormal-list">
          {pending?.abnormal.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </AlertModal>
    </>
  );
}
