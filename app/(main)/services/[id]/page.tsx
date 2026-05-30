import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, ArrowLeft, Shield, Clock, RotateCcw, Sparkles } from 'lucide-react'
import OrderButton from '@/components/shared/OrderButton'
import Navbar from '@/components/shared/Navbar'

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      freelancer: true,
      reviews: {
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!service) notFound()

  const avgRating =
    service.reviews.length > 0
      ? (
          service.reviews.reduce((a, b) => a + b.rating, 0) /
          service.reviews.length
        ).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <Navbar active="services" userName={session?.user?.name || undefined} isLoggedIn={!!session} />

      <div className="max-w-6xl mx-auto px-8 pt-28 pb-10 grid md:grid-cols-3 gap-8 relative z-10">
        {/* Left — Detail */}
        <div className="md:col-span-2 space-y-6">
          {/* Main Info Box */}
          <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-xl">
            {/* Image Placeholder Banner */}
            <div className="h-64 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border-b border-white/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-violet-600/5" />
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[100px] filter drop-shadow-[0_12px_24px_rgba(124,58,237,0.3)] animate-float">
                  {service.category === 'Web Development' ? '💻' :
                   service.category === 'Desain Grafis' ? '🎨' :
                   service.category === 'Penulisan & Konten' ? '📝' :
                   service.category === 'Mobile App' ? '📱' :
                   service.category === 'Video & Animasi' ? '🎬' :
                   service.category === 'Data & Analisis' ? '📊' :
                   service.category === 'Keamanan Siber' ? '🔒' : '🤖'}
                </span>
              )}
            </div>

            <div className="p-6">
              <span className="text-[10px] text-violet-400 font-extrabold bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                {service.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-4 mb-4 tracking-tight leading-tight">
                {service.title}
              </h1>
              <div className="flex items-center gap-6 border-t border-white/5 pt-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-600/10 border border-violet-500/25 rounded-full flex items-center justify-center shadow-lg shadow-violet-600/10">
                    <span className="text-violet-400 text-sm font-extrabold">
                      {service.freelancer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Freelancer</p>
                    <p className="text-sm font-semibold text-zinc-300">{service.freelancer.name}</p>
                  </div>
                </div>
                {avgRating && (
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-yellow-500/5 border border-yellow-500/20 rounded-full flex items-center justify-center">
                      <Star className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Rating</p>
                      <p className="text-sm font-semibold text-zinc-300">
                        {avgRating} <span className="text-zinc-500 text-xs font-light">({service.reviews.length} ulasan)</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl">
            <h2 className="font-extrabold text-white text-lg mb-4 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" /> Deskripsi Jasa
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-light">
              {service.description}
            </p>
          </div>

          {/* Reviews */}
          <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl">
            <h2 className="font-extrabold text-white text-lg mb-4 tracking-tight">
              Ulasan Klien ({service.reviews.length})
            </h2>
            {service.reviews.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/1">
                <Star className="w-8 h-8 mx-auto text-zinc-600 mb-2 opacity-50" />
                <p className="text-sm text-zinc-500 font-light">Belum ada ulasan untuk jasa ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {service.reviews.map(review => (
                  <div key={review.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                        <span className="text-zinc-300 text-xs font-bold">
                          {review.reviewer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {review.reviewer.name}
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-zinc-700 fill-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-zinc-400 ml-11 font-light leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Order Card */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-white/5 p-6 sticky top-24 shadow-2xl overflow-hidden relative">
            <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-violet-600/10 blur-xl pointer-events-none" />
            
            <div className="text-3xl font-extrabold text-white mb-1 tracking-tight">
              Rp {service.price.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-zinc-500 mb-6 font-bold uppercase tracking-wider">Harga per proyek</p>

            <div className="space-y-4 mb-6 border-y border-white/5 py-5">
              {[
                { icon: <Clock className="w-4.5 h-4.5" />, text: 'Pengerjaan cepat & profesional' },
                { icon: <RotateCcw className="w-4.5 h-4.5" />, text: 'Revisi sampai puas' },
                { icon: <Shield className="w-4.5 h-4.5" />, text: 'Pembayaran aman via escrow' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3.5 text-sm text-zinc-300 font-light">
                  <span className="text-violet-400">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            {session ? (
              session.user.role === 'CLIENT' ? (
                <OrderButton
                  serviceId={service.id}
                  price={service.price}
                  freelancerId={service.freelancerId}
                />
              ) : session.user.id === service.freelancerId ? (
                <Link
                  href={`/services/${service.id}/edit`}
                  className="block w-full text-center bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 cursor-pointer"
                >
                  Edit Jasa Anda
                </Link>
              ) : (
                <div className="text-center text-xs text-zinc-500 py-3 bg-white/1 border border-white/5 rounded-xl font-light">
                  Freelancer tidak bisa memesan jasa
                </div>
              )
            ) : (
              <Link
                href="/login"
                className="block w-full text-center bg-gradient-to-r from-violet-600 to-primary-600 text-white py-3.5 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                Login untuk Pesan
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}