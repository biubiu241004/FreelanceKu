'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLIENT',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/users/register', form)
      toast.success('Akun berhasil dibuat! Silakan login.')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/5 p-8 shadow-2xl relative z-10 my-8">
        <Link href="/" className="flex items-center gap-2 mb-8 inline-block">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            Freelance<span className="text-violet-500">Ku</span>
          </span>
        </Link>

        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Buat Akun Baru</h1>
        <p className="text-zinc-400 text-sm mb-8 font-light">Bergabung gratis hari ini dan temukan potensi terbaik Anda</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Masukkan alamat email aktif"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Daftar Sebagai</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
            >
              <option value="CLIENT" className="bg-[#0b0b0e] text-[#f4f4f5]">Klien — Saya ingin mencari jasa</option>
              <option value="FREELANCER" className="bg-[#0b0b0e] text-[#f4f4f5]">Freelancer — Saya ingin menawarkan jasa</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-accent-pink text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6 font-light">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-violet-400 font-bold hover:text-violet-300 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}