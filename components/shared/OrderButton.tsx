'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function OrderButton({
  serviceId,
  price,
  freelancerId,
}: {
  serviceId: string
  price: number
  freelancerId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleOrder = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/orders', {
        serviceId,
        freelancerId,
        note,
        totalPrice: price,
      })
      toast.success('Order berhasil dibuat!')
      router.push(`/orders/${res.data.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 cursor-pointer"
      >
        Pesan Sekarang
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        placeholder="Catatan untuk freelancer (opsional)..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300 resize-none font-light leading-relaxed"
      />
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? 'Memproses...' : 'Konfirmasi Order'}
      </button>
      <button
        onClick={() => setShowForm(false)}
        className="w-full bg-white/3 hover:bg-white/6 text-zinc-300 border border-white/5 hover:border-white/10 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-95 cursor-pointer"
      >
        Batal
      </button>
    </div>
  )
}