'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email atau password salah!')
        return
      }

      toast.success('Berhasil masuk!')
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error('Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      <div className="glass-panel w-full max-w-md rounded-3xl border border-white/5 p-8 shadow-2xl relative z-10">
        <Link href="/" className="flex items-center gap-2 mb-8 inline-block">
          <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight">
            Freelance<span className="text-violet-500">Ku</span>
          </span>
        </Link>

        <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">Selamat Datang Kembali!</h1>
        <p className="text-zinc-400 text-sm mb-8 font-light">Masuk ke akun FreelanceKu untuk mengelola proyek Anda</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Email</label>
            <input
              type="email"
              placeholder="Masukkan email terdaftar"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-300 block mb-1.5">Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Memproses...' : 'Masuk ke Akun'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6 font-light">
          Belum punya akun?{' '}
          <Link href="/register" className="text-violet-400 font-bold hover:text-violet-300 hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  )
}