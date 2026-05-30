'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function EditProfileForm({
  userId,
  name,
  bio,
}: {
  userId: string
  name: string
  bio: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name, bio })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.patch(`/api/users/${userId}`, form)
      toast.success('Profil berhasil diperbarui!')
      router.refresh()
    } catch (error) {
      toast.error('Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-zinc-300 block mb-1.5">
          Nama Lengkap
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
          required
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-zinc-300 block mb-1.5">
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={e => setForm({ ...form, bio: e.target.value })}
          placeholder="Ceritakan sedikit tentang dirimu..."
          rows={3}
          className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-violet-600 to-primary-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  )
}