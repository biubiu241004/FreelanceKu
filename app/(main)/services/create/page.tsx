'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Zap, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Navbar from '@/components/shared/Navbar'
import { useSession } from 'next-auth/react'

const categories = [
  'Web Development',
  'Desain Grafis',
  'Penulisan & Konten',
  'Mobile App',
  'Video & Animasi',
  'Data & Analisis',
  'Keamanan Siber',
  'AI & Machine Learning',
]

export default function CreateServicePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '', // initialized as empty string to force selection
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) {
      toast.error('Silakan pilih kategori jasa terlebih dahulu!')
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/services', {
        ...form,
        price: parseFloat(form.price),
      })
      toast.success('Jasa berhasil ditambahkan!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <Navbar active="services" userName={session?.user?.name || undefined} isLoggedIn={!!session} />

      <div className="max-w-2xl mx-auto px-8 pt-28 pb-12 relative z-10">
        <div className="glass-panel rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-600/10 border border-violet-500/25 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/10">
              <Zap className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-2xl text-white tracking-tight">Tambah Jasa Baru</h2>
              <p className="text-xs text-zinc-400 mt-1 font-light">Tawarkan keahlian terbaikmu dan mulailah menghasilkan pendapatan.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 border-t border-white/5 pt-6">
            <div>
              <label className="text-sm font-semibold text-zinc-300 block mb-2">
                Judul Jasa
              </label>
              <input
                type="text"
                placeholder="Contoh: Saya akan membuat website profesional"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-300 block mb-2">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 [&>option]:bg-[#121217] [&>option]:text-white"
                required
              >
                <option value="" disabled>Pilih Kategori...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-300 block mb-2">
                Deskripsi Jasa
              </label>
              <textarea
                placeholder="Jelaskan detail jasa yang kamu tawarkan, pengalaman, dan apa yang akan klien dapatkan secara lengkap..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none font-light leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-300 block mb-2">
                Harga Jasa (Rp)
              </label>
              <input
                type="number"
                placeholder="Contoh: 150000"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                required
                min={10000}
              />
              {form.price && (
                <p className="text-xs text-violet-400 mt-2 font-bold tracking-wide">
                  Rp {parseFloat(form.price).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <Link
                href="/dashboard"
                className="flex-1 text-center bg-white/3 hover:bg-white/6 text-zinc-300 border border-white/5 hover:border-white/10 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-95"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Menyimpan...' : 'Tambah Jasa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}