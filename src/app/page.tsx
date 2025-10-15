// src/app/page.tsx

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Secara permanen mengarahkan pengguna dari halaman utama ke halaman login
  redirect('/login');

  // Anda bisa return null atau komponen loading,
  // tapi redirect akan terjadi sebelum komponen ini sempat ditampilkan.
  return null;
}