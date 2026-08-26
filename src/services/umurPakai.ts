import type { UmurPakai } from '@domainTypes/index';
import { list, get, create, update } from './api';

/**
 * Umur pakai konsumabel treatment, ditetapkan Kepala Divisi.
 *
 * Angkanya sengaja tidak dibawakan sistem. Masa pakai karbon aktif berkisar
 * bulan sampai tahun tergantung karakter air yang diolah, jadi nilai bawaan
 * apa pun akan salah di sebagian hatchery — dan pengingat yang salah lebih
 * buruk daripada tidak ada pengingat.
 */

/** Jenis tindakan perawatan yang punya umur pakai (§02 PDF). */
export const KONSUMABEL = ['ganti lampu UV', 'ganti karbon', 'servis generator ozon'];

export async function muatUmurPakai(): Promise<UmurPakai[]> {
  return (await list('umurPakai')) as UmurPakai[];
}

export async function simpanUmurPakai(u: UmurPakai) {
  const ada = await get('umurPakai', u.id);
  return ada ? update('umurPakai', u.id, u) : create('umurPakai', u);
}
