'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Link as LinkIcon,
  MessageSquareCode,
  X,
  Send,
  Sparkles
} from 'lucide-react'
import PaymentButton from './PaymentButton'

export default function OrderActions({
  orderId,
  status,
  isClient,
  isFreelancer,
  payment,
  totalPrice,
  clientId,
  freelancerId,
}: {
  orderId: string
  status: string
  isClient: boolean
  isFreelancer: boolean
  payment: any
  totalPrice: number
  clientId: string
  freelancerId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Work Delivery Modal States
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false)
  const [deliveryLink, setDeliveryLink] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')

  const updateStatus = async (newStatus: string) => {
    setLoading(true)
    try {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus })
      toast.success('Status order diperbarui!')
      router.refresh()
    } catch (error) {
      toast.error('Terjadi kesalahan!')
    } finally {
      setLoading(false)
    }
  }

  // Handle Work Submission (Deliverables)
  const handleDeliverSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deliveryLink.trim()) {
      toast.error('Tautan berkas/folder hasil pekerjaan wajib diisi!')
      return
    }
    if (!deliveryNote.trim()) {
      toast.error('Catatan pengiriman untuk klien wajib diisi!')
      return
    }

    setLoading(true)
    try {
      // 1. Kirim berkas link & pesan resmi ke chat log order
      await axios.post('/api/messages', {
        orderId,
        receiverId: clientId, // Sebagai freelancer, penerima pesan pengiriman adalah klien
        content: `📦 HASIL PEKERJAAN DIKIRIM:\n\n🔗 Tautan Berkas: ${deliveryLink.trim()}\n\n💬 Catatan Freelancer: ${deliveryNote.trim()}`
      })

      // 2. Tandai status order menjadi COMPLETED
      await axios.patch(`/api/orders/${orderId}`, { status: 'COMPLETED' })

      toast.success('Hasil pekerjaan resmi berhasil diserahkan!')
      setDeliveryModalOpen(false)
      setDeliveryLink('')
      setDeliveryNote('')
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Gagal mengirimkan berkas pekerjaan!')
    } finally {
      setLoading(false)
    }
  }

  const isPaid = payment?.status === 'PAID'

  return (
    <>
      <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
        <h3 className="font-bold text-white text-lg mb-4">Aksi Order</h3>

        <div className="flex flex-wrap gap-3">

          {/* Client: Bayar dulu sebelum freelancer mulai */}
          {isClient && status === 'ACCEPTED' && !isPaid && (
            <PaymentButton orderId={orderId} totalPrice={totalPrice} />
          )}

          {isClient && status === 'ACCEPTED' && isPaid && (
            <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
              ✅ Pembayaran lunas — menunggu freelancer mulai
            </div>
          )}

          {/* Freelancer Actions */}
          {isFreelancer && status === 'PENDING' && (
            <>
              <button
                onClick={() => updateStatus('ACCEPTED')}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition duration-200 disabled:opacity-50 cursor-pointer animate-ambient"
              >
                <CheckCircle className="w-4 h-4" /> Terima Order
              </button>
              <button
                onClick={() => updateStatus('CANCELLED')}
                disabled={loading}
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-red-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 hover:border-red-500/20 transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Tolak Order
              </button>
            </>
          )}

          {isFreelancer && status === 'ACCEPTED' && isPaid && (
            <button
              onClick={() => updateStatus('IN_PROGRESS')}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4" /> Mulai Kerjakan
            </button>
          )}

          {isFreelancer && status === 'ACCEPTED' && !isPaid && (
            <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              ⏳ Menunggu pembayaran dari klien
            </div>
          )}

          {/* Freelancer: Pemicu Modal Pengiriman Hasil Kerja */}
          {isFreelancer && status === 'IN_PROGRESS' && (
            <button
              onClick={() => setDeliveryModalOpen(true)}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Kirim Hasil Pekerjaan (Selesai)
            </button>
          )}

          {isFreelancer && status === 'REVISION' && (
            <button
              onClick={() => setDeliveryModalOpen(true)}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Kirim Hasil Revisi Berkas
            </button>
          )}

          {isFreelancer && status === 'COMPLETED' && payment?.status !== 'RELEASED' && (
            <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              ⏳ Berkas terkirim! Menunggu persetujuan atau revisi dari klien
            </div>
          )}

          {/* Client: Approve atau Minta Revisi */}
          {isClient && status === 'COMPLETED' && payment?.status !== 'RELEASED' && (
            <>
              <button
                onClick={() => updateStatus('REVISION')}
                disabled={loading}
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-orange-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-500/10 hover:border-orange-500/20 transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Minta Revisi Pekerjaan
              </button>
              <button
                onClick={async () => {
                  await updateStatus('COMPLETED')
                  await axios.patch(`/api/payments/${orderId}`, { status: 'RELEASED' })
                  toast.success('Dana escrow berhasil dicairkan ke freelancer!')
                  router.refresh()
                }}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Setujui & Cairkan Dana
              </button>
            </>
          )}

          {isClient && status === 'REVISION' && (
            <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
              ⏳ Menunggu revisi hasil dikirim ulang oleh freelancer
            </div>
          )}

          {isClient && status === 'PENDING' && (
            <button
              onClick={() => updateStatus('CANCELLED')}
              disabled={loading}
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-red-400 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 hover:border-red-500/20 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" /> Batalkan Order
            </button>
          )}

          {status === 'CANCELLED' && (
            <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              Order telah dibatalkan
            </div>
          )}

          {payment?.status === 'RELEASED' && (
            <div className="flex flex-col gap-2">
              <div className="text-xs px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                ✅ Dana sudah dicairkan ke freelancer
              </div>
              {isClient && (
                <p className="text-[10px] text-zinc-400 font-light mt-1 animate-pulse">
                  👉 Mohon berikan rating kepuasan di bawah untuk mengaktifkan reputasi freelancer secara resmi.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Deliverable Modal (Freelancer Only) */}
      {deliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-violet-500/25 bg-[#0a0a0f] p-6 shadow-2xl space-y-6 overflow-hidden">
            <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
              <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Kirim Hasil Pekerjaan Resmi
              </h3>
              <button
                onClick={() => setDeliveryModalOpen(false)}
                className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeliverSubmit} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-violet-400" /> Tautan Berkas / Folder Hasil Kerja
                </label>
                <input
                  type="url"
                  value={deliveryLink}
                  onChange={(e) => setDeliveryLink(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/... atau https://figma.com/..."
                  required
                  className="w-full bg-white/2 hover:bg-white/4 border border-white/5 focus:border-violet-500/40 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition placeholder-zinc-500 font-light"
                />
                <p className="text-[8px] text-zinc-500 font-light pl-1">
                  *Masukkan link tautan berkas penyimpanan (Google Drive, Dropbox, Figma, GitHub, dll.)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquareCode className="w-3.5 h-3.5 text-violet-400" /> Pesan / Catatan Penyelesaian
                </label>
                <textarea
                  rows={4}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Tulis rincian pengerjaan Anda, instruksi pembukaan berkas, atau pesan penutup projek kepada klien..."
                  required
                  className="w-full bg-white/2 hover:bg-white/4 border border-white/5 focus:border-violet-500/40 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition placeholder-zinc-500 font-light resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-accent-pink text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  'Mengirim berkas pekerjaan...'
                ) : (
                  <>
                    Kirim & Tandai Selesai <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}