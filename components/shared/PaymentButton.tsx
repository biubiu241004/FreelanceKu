'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import { CreditCard } from 'lucide-react'

declare global {
  interface Window {
    snap: any
  }
}

export default function PaymentButton({
  orderId,
  totalPrice,
}: {
  orderId: string
  totalPrice: number
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await axios.post('/api/payments', { orderId })
      const { token } = res.data

      // Load Midtrans Snap
      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: async () => {
            await axios.patch(`/api/payments/${orderId}`, { status: 'PAID' })
            toast.success('Pembayaran berhasil!')
            router.refresh()
          },
          onPending: () => {
            toast('Pembayaran pending, selesaikan pembayaran ya!')
            router.refresh()
          },
          onError: () => {
            toast.error('Pembayaran gagal!')
          },
          onClose: () => {
            toast('Pembayaran dibatalkan')
          },
        })
      }
    } catch (error) {
      toast.error('Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
    >
      <CreditCard className="w-4 h-4" />
      {loading ? 'Memproses...' : `Bayar Rp ${totalPrice.toLocaleString('id-ID')}`}
    </button>
  )
}