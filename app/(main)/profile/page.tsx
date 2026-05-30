import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Briefcase,
  ShoppingBag,
  Award,
  Clock,
  CheckCircle,
  Zap,
  Shield,
  Sparkles,
  Heart
} from 'lucide-react'
import EditProfileForm from '@/components/shared/EditProfileForm'
import LogoutButton from '@/components/shared/LogoutButton'
import Navbar from '@/components/shared/Navbar'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      services: {
        include: { reviews: true },
        orderBy: { createdAt: 'desc' }
      },
      ordersAsClient: {
        include: { service: true },
        orderBy: { createdAt: 'desc' }
      },
      ordersAsFreelancer: {
        include: { service: true },
        orderBy: { createdAt: 'desc' }
      },
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' }
      },
    },
  })

  if (!user) redirect('/login')

  const isFreelancer = user.role === 'FREELANCER'

  const avgRating =
    user.reviewsReceived.length > 0
      ? (
          user.reviewsReceived.reduce((acc: number, rev: any) => acc + rev.rating, 0) /
          user.reviewsReceived.length
        ).toFixed(1)
      : null

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <Navbar active="profile" userName={user.name} isLoggedIn={true} />

      <div className="max-w-6xl mx-auto px-8 pt-28 pb-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left / Middle Columns (Col Span 2) — Main Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Profile Overview Card */}
            <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/2 to-white/0 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
                <div className="w-20 h-20 bg-violet-600/10 border border-violet-500/25 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-600/15 group-hover:scale-105 transition-all duration-300">
                  <span className="text-violet-400 text-3xl font-extrabold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0 ${
                      isFreelancer
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isFreelancer ? 'Freelancer' : 'Klien'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 font-light">{user.email}</p>
                  {user.bio ? (
                    <p className="text-xs text-zinc-300 font-light max-w-lg leading-relaxed pt-1.5 italic">
                      "{user.bio}"
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 font-light pt-1.5">Bio belum ditambahkan. Perbarui profil di kolom sebelah kanan.</p>
                  )}
                </div>
              </div>

              {/* Stats Panel */}
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                {isFreelancer ? (
                  <>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <Briefcase className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">{user.services.length}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Jasa Aktif</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <ShoppingBag className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">{user.ordersAsFreelancer.length}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Order Selesai</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/10 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">{avgRating || '0.0'}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Reputasi</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <ShoppingBag className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">{user.ordersAsClient.length}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Order Selesai</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/10 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">{user.reviewsReceived.length}</p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Review Diberi</p>
                    </div>
                    <div className="bg-white/3 border border-white/5 rounded-2xl p-4 text-center">
                      <Briefcase className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-extrabold text-white">
                        {user.ordersAsClient.length + user.ordersAsFreelancer.length}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Total Order</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Achievements & Badges Widget */}
            <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
              <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-400" /> Pencapaian & Lencana Akun
              </h2>
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm">
                  <Shield className="w-4 h-4 text-accent-pink" /> KTM Terverifikasi (Mahasiswa Aktif)
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm">
                  <Clock className="w-4 h-4" /> Respon Kilat (&lt; 1 Jam)
                </div>
                {isFreelancer ? (
                  <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm">
                    <Zap className="w-4 h-4 fill-yellow-400/25" /> Top Rated Student Talent
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-2 rounded-2xl text-xs font-semibold shadow-sm">
                    <Heart className="w-4 h-4 fill-blue-400/25" /> Escrow Verified Client
                  </div>
                )}
              </div>
            </div>

            {/* Showcase Katalog (Freelancer Jasa atau Client Projects) */}
            {isFreelancer ? (
              <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" /> Katalog Jasa Kreatif Saya
                  </h2>
                  <Link href="/services/create" className="text-xs text-violet-400 hover:text-violet-300 font-bold">
                    + Jasa Baru
                  </Link>
                </div>
                
                {user.services.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/1">
                    <p className="text-sm text-zinc-500 font-light">Katalog Anda masih kosong.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {user.services.map(svc => (
                      <div key={svc.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-white/10 transition">
                        <div>
                          <span className="text-[8px] text-violet-400 font-extrabold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {svc.category}
                          </span>
                          <h3 className="font-bold text-zinc-200 text-sm mt-2 line-clamp-1">{svc.title}</h3>
                          <p className="text-xs font-extrabold text-zinc-400 mt-2">Rp {svc.price.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                          <Link href={`/services/${svc.id}`} className="flex-1 text-center bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 py-1.5 rounded-xl text-[10px] font-bold transition">
                            Detail
                          </Link>
                          <Link href={`/services/${svc.id}/edit`} className="flex-1 text-center bg-gradient-to-r from-violet-600 to-primary-600 text-white py-1.5 rounded-xl text-[10px] font-bold transition">
                            Edit
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
                <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Riwayat Pemesanan Jasa
                </h2>
                
                {user.ordersAsClient.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/1">
                    <p className="text-sm text-zinc-500 font-light">Belum ada riwayat pesanan.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.ordersAsClient.slice(0, 3).map(order => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-2xl transition block"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 text-xs line-clamp-1">{order.service.title}</p>
                            <p className="text-[10px] text-zinc-500 font-light mt-1">Status Selesai</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-violet-400">
                          Rp {order.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews list received (Freelancer Only) */}
            {isFreelancer && (
              <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-4">
                <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2 border-b border-white/5 pb-3">
                  <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400/10" /> Ulasan & Feedback Klien ({user.reviewsReceived.length})
                </h2>

                {user.reviewsReceived.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/1">
                    <p className="text-sm text-zinc-500 font-light">Belum menerima ulasan klien.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user.reviewsReceived.map(review => (
                      <div key={review.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-7 h-7 bg-white/5 border border-white/5 rounded-full flex items-center justify-center">
                            <span className="text-zinc-300 text-[10px] font-bold">
                              {review.reviewer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">{review.reviewer.name}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-2.5 h-2.5 ${
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
                          <p className="text-xs text-zinc-400 ml-10 font-light leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column (Col Span 1) — Forms & Performance */}
          <div className="space-y-6">
            
            {/* Edit Profile Form */}
            <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl">
              <h2 className="font-extrabold text-white text-base mb-4 tracking-tight">Edit Profil Saya</h2>
              <EditProfileForm
                userId={user.id}
                name={user.name}
                bio={user.bio || ''}
              />
            </div>

            {/* Performance Analytics Progress Bars */}
            <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-4 relative overflow-hidden">
              <h2 className="font-extrabold text-white text-base tracking-tight border-b border-white/5 pb-3">
                Kinerja & Komitmen Pelayanan
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-semibold">
                    <span>Penyelesaian Proyek</span>
                    <span className="text-violet-400">98%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-violet-600 to-accent-pink h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-semibold">
                    <span>Kecepatan Respon</span>
                    <span className="text-cyan-400">&lt; 1 Jam (99%)</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: '99%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-semibold">
                    <span>Pengiriman Tepat Waktu</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Panel */}
            <div className="glass-panel rounded-3xl border border-red-500/10 hover:border-red-500/20 p-6 shadow-xl flex items-center justify-between transition-all duration-300">
              <div>
                <h2 className="font-extrabold text-red-400 text-sm">Keluar Sesi</h2>
                <p className="text-[10px] text-zinc-500 mt-1 font-light leading-relaxed">Keluar dari sesi akun Anda secara aman.</p>
              </div>
              <div className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl transition duration-300">
                <LogoutButton />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}