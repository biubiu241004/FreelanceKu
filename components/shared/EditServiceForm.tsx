'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Trash2 } from 'lucide-react'

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

interface Service {
  id: string
  title: string
  description: string
  price: number
  category: string
}

export default function EditServiceForm({ service }: { service: Service }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({
    title: service.title,
    description: service.description,
    price: service.price.toString(),
    category: service.category,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.patch(`/api/services/${service.id}`, {
        ...form,
        price: parseFloat(form.price),
      })
      toast.success('Jasa berhasil diperbarui!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus jasa ini?')
    if (!confirmDelete) return

    setDeleteLoading(true)
    try {
      await axios.delete(`/api/services/${service.id}`)
      toast.success('Jasa berhasil dihapus!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menghapus!')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/5">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLoading || loading}
          className="flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 py-3.5 px-5 rounded-xl font-bold text-sm transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 className="w-4.5 h-4.5" />
          {deleteLoading ? 'Menghapus...' : 'Hapus Jasa'}
        </button>

        <div className="flex-1 flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 text-center bg-white/3 hover:bg-white/6 text-zinc-300 border border-white/5 hover:border-white/10 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-95"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading || deleteLoading}
            className="flex-1 bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </form>
  )
}
