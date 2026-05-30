import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, FolderOpen, DownloadCloud } from 'lucide-react'
import OrderActions from '@/components/shared/OrderActions'
import MessageForm from '@/components/shared/MessageForm'
import ReviewForm from '@/components/shared/ReviewForm'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      client: true,
      freelancer: true,
      payment: true,
      messages: {
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!order) notFound()

  // Query review untuk pesanan ini
  const review = await prisma.review.findFirst({
    where: {
      serviceId: order.serviceId,
      reviewerId: order.clientId,
    }
  })

  // Cari pesan pengiriman berkas dari freelancer
  const deliveryMessages = order.messages.filter(msg =>
    msg.content.startsWith('📦 HASIL PEKERJAAN DIKIRIM:')
  )
  const latestDelivery = deliveryMessages.length > 0 ? deliveryMessages[deliveryMessages.length - 1] : null

  let deliveryLink = ''
  let deliveryNote = ''
  if (latestDelivery) {
    const linkMatch = latestDelivery.content.match(/🔗 Tautan Berkas: (.*)/)
    if (linkMatch) deliveryLink = linkMatch[1].trim()

    const noteMatch = latestDelivery.content.match(/💬 Catatan Freelancer: ([\s\S]*)/)
    if (noteMatch) deliveryNote = noteMatch[1].trim()
  }

  const isClient = session.user.id === order.clientId
  const isFreelancer = session.user.id === order.freelancerId

  if (!isClient && !isFreelancer) redirect('/dashboard')

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    ACCEPTED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    IN_PROGRESS: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    REVISION: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Menunggu Konfirmasi',
    ACCEPTED: 'Diterima',
    IN_PROGRESS: 'Sedang Dikerjakan',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REVISION: 'Revisi',
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#060608]/75 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center gap-4 sticky top-0 z-50">
        <Link href="/orders" className="text-zinc-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-extrabold text-white tracking-tight">Detail Order</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6 relative z-10">
        {/* Order Info */}
        <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">ID Order</p>
              <p className="text-xs font-mono text-zinc-400">{order.id}</p>
            </div>
            <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${statusColor[order.status]}`}>
              {statusLabel[order.status]}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight mb-1 leading-snug">{order.service.title}</h2>
          <p className="text-xs text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full mt-2.5 inline-block uppercase tracking-wider">
            {order.service.category}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-5">
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Klien</p>
              <p className="text-sm font-semibold text-zinc-200">{order.client.name}</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Freelancer</p>
              <p className="text-sm font-semibold text-zinc-200">{order.freelancer.name}</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Total Harga</p>
              <p className="text-sm font-extrabold text-violet-400">
                Rp {order.totalPrice.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Tanggal Order</p>
              <p className="text-sm font-semibold text-zinc-200">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {order.note && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/25 rounded-2xl p-4">
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1.5">Catatan dari Klien</p>
              <p className="text-sm text-zinc-300 font-light leading-relaxed">{order.note}</p>
            </div>
          )}
        </div>
        {/* Widget Pengiriman Hasil Pekerjaan Resmi */}
        {deliveryLink && (
          <div className="glass-panel rounded-3xl border border-violet-500/30 p-6 shadow-2xl bg-gradient-to-br from-violet-950/15 via-[#08080c] to-zinc-950 mt-6 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[60px] pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                  📦 Hasil Pekerjaan Siap Diunduh
                </h3>
                <p className="text-[10px] text-zinc-400 font-light mt-0.5">
                  {isFreelancer ? 'Anda telah menyerahkan berkas berikut untuk projek ini' : 'Freelancer telah menyerahkan berkas penyelesaian projek Anda'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {deliveryNote && (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Catatan Pengerjaan Freelancer</p>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed whitespace-pre-wrap">"{deliveryNote}"</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-violet-500/5 border border-violet-500/10 p-4 rounded-2xl">
                <div>
                  <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider">Tautan Penyimpanan</p>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5 line-clamp-1 select-all">{deliveryLink}</p>
                </div>
                <a
                  href={deliveryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-violet-600 to-accent-pink text-white px-5 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 text-center flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Buka / Unduh File Kerja <DownloadCloud className="w-4 h-4" />
                </a>
              </div>

              {isClient && order.status === 'COMPLETED' && order.payment?.status !== 'RELEASED' && (
                <p className="text-[9px] text-zinc-400 font-light text-center leading-relaxed mt-2 select-none animate-pulse">
                  ⚠️ Harap unduh dan tinjau berkas hasil kerja di atas terlebih dahulu. Jika sudah sesuai, cairkan dana di bawah. Jika tidak, minta revisi.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Order Actions */}
        <OrderActions
          orderId={order.id}
          status={order.status}
          isClient={isClient}
          isFreelancer={isFreelancer}
          payment={order.payment}
          totalPrice={order.totalPrice}
          clientId={order.clientId}
          freelancerId={order.freelancerId}
        />

        {/* Ulasan & Rating Wajib Flow */}
        {order.status === 'COMPLETED' && order.payment?.status === 'RELEASED' && (
          <>
            {isClient && (
              <>
                {review ? (
                  <div className="glass-panel rounded-3xl border border-emerald-500/20 p-6 shadow-xl bg-gradient-to-br from-emerald-950/10 via-[#0a0a0f] to-zinc-950/50 mt-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-600/5 to-transparent rounded-bl-full pointer-events-none" />
                    <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                      Ulasan Anda Telah Dikirim
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mb-4">
                      Terima kasih telah memberikan penilaian. Rating reputasi freelancer telah diaktifkan!
                    </p>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-zinc-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-zinc-300 ml-1.5">{review.rating} / 5</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-300 font-light italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <ReviewForm orderId={order.id} />
                )}
              </>
            )}

            {isFreelancer && (
              <>
                {review ? (
                  <div className="glass-panel rounded-3xl border border-violet-500/20 p-6 shadow-xl bg-gradient-to-br from-violet-950/10 via-[#0a0a0f] to-zinc-950/50 mt-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-600/5 to-transparent rounded-bl-full pointer-events-none" />
                    <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-violet-400 fill-violet-400" />
                      Ulasan dari Klien
                    </h3>
                    <p className="text-xs text-zinc-400 font-light mb-4">
                      Reputasi Anda aktif dan ter-update berdasarkan feedback dari klien untuk pesanan ini.
                    </p>
                    <div className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-zinc-600'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-zinc-300 ml-1.5">{review.rating} / 5</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-zinc-300 font-light italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel rounded-3xl border border-yellow-500/20 p-6 shadow-xl bg-gradient-to-br from-yellow-950/10 via-[#0a0a0f] to-zinc-950/50 mt-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-600/5 to-transparent rounded-bl-full pointer-events-none" />
                    <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 mb-1.5">
                      <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                      Menunggu Ulasan Klien
                    </h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed">
                      Pesanan telah selesai dikerjakan dan dana telah dicairkan! Reputasi bintang Anda akan aktif dan muncul di profil segera setelah klien memberikan ulasan kepuasan mereka.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {/* Chat */}
        <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl">
          <h3 className="font-bold text-white text-lg mb-6 border-b border-white/5 pb-4">Diskusi & Chat</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2">
            {order.messages.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-10">
                Belum ada pesan. Mulai obrolan untuk diskusi!
              </p>
            ) : (
              order.messages.map(msg => {
                const isMe = msg.senderId === session.user.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] transition shadow-sm' 
                        : 'bg-white/5 border border-white/5 text-zinc-200'
                    }`}>
                      <p className="leading-relaxed font-light">{msg.content}</p>
                      <p className={`text-[10px] text-right mt-1.5 ${isMe ? 'text-violet-200' : 'text-zinc-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <MessageForm
            orderId={order.id}
            receiverId={isClient ? order.freelancerId : order.clientId}
          />
        </div>
      </div>
    </div>
  )
}