'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
    >
      <LogOut className="w-4 h-4" />
      Keluar dari Akun
    </button>
  )
}