'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Send } from 'lucide-react'

export default function MessageForm({
  orderId,
  receiverId,
}: {
  orderId: string
  receiverId: string
}) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      await axios.post('/api/messages', {
        orderId,
        receiverId,
        content: message,
      })
      setMessage('')
      router.refresh()
    } catch (error) {
      toast.error('Gagal mengirim pesan!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSend} className="flex gap-2">
      <input
        type="text"
        placeholder="Ketik pesan..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="flex-1 bg-white/3 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
      />
      <button
        type="submit"
        disabled={loading || !message.trim()}
        className="bg-gradient-to-r from-violet-600 to-primary-600 text-white px-4 py-2.5 rounded-xl hover:shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}