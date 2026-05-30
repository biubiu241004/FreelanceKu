'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Star, MessageSquareCode, Send } from 'lucide-react'

export default function ReviewForm({
  orderId,
}: {
  orderId: string
}) {
  const router = useRouter()
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Silakan berikan rating bintang terlebih dahulu!')
      return
    }

    setLoading(false)
    try {
      setLoading(true)
      const res = await axios.post('/api/reviews', {
        orderId,
        rating,
        comment,
      })
      toast.success(res.data.message || 'Ulasan berhasil dikirim!')
      router.refresh()
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Gagal mengirim ulasan!'
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel rounded-3xl border border-violet-500/20 p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-violet-950/10 via-[#0a0a0f] to-zinc-950/50 mt-6 group">
      {/* Glow effect */}
      <div className="absolute top-[-20%] right-[-20%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-20%] w-[35%] h-[35%] rounded-full bg-pink-500/5 blur-[60px] pointer-events-none" />

      <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 mb-2">
        <MessageSquareCode className="w-5 h-5 text-violet-400" />
        Beri Ulasan & Aktifkan Reputasi Freelancer
      </h3>
      <p className="text-xs text-zinc-400 font-light mb-5">
        Pesanan telah selesai! Sila isi tingkat kepuasan dan ulasan Anda untuk mencatat rating reputasi resmi freelancer ini di platform.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* Star Rating Interactive Selector */}
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Rating Kepuasan</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= (hoverRating || rating)
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition duration-150 transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors duration-200 ${
                      active
                        ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                        : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                  />
                </button>
              )
            })}
            {rating > 0 && (
              <span className="text-xs font-bold text-yellow-400 ml-2">
                {rating === 1 && 'Sangat Kurang ⭐️'}
                {rating === 2 && 'Kurang Memuaskan ⭐️⭐️'}
                {rating === 3 && 'Cukup Bagus ⭐️⭐️⭐️'}
                {rating === 4 && 'Sangat Memuaskan ⭐️⭐️⭐️⭐️'}
                {rating === 5 && 'Sempurna & Luar Biasa! ⭐️⭐️⭐️⭐️⭐️'}
              </span>
            )}
          </div>
        </div>

        {/* Feedback text area */}
        <div className="space-y-2">
          <label htmlFor="comment" className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tulis Ulasan Masukan</label>
          <textarea
            id="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis testimoni Anda tentang kualitas pengerjaan, respon, dan ketepatan waktu freelancer..."
            className="w-full bg-white/2 hover:bg-white/4 border border-white/5 focus:border-violet-500/40 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition placeholder-zinc-500 font-light resize-none"
            required
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="w-full bg-gradient-to-r from-violet-600 to-accent-pink text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            'Mengirim ulasan...'
          ) : (
            <>
              Kirim Ulasan & Aktifkan Reputasi <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
