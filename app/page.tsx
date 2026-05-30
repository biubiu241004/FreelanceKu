import Link from 'next/link'
import { ArrowRight, Star, Shield, Zap, Users, Sparkles, Trophy, CheckCircle, Search, Briefcase, Award } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/shared/Navbar'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  let userData = null
  let recommendedServices: any[] = []
  let topFreelancers: any[] = []

  if (session) {
    userData = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        services: true,
        ordersAsClient: {
          where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'REVISION'] } },
          include: { service: true }
        },
        ordersAsFreelancer: {
          where: { status: { in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'REVISION'] } },
          include: { service: true }
        },
      }
    })

    recommendedServices = await prisma.service.findMany({
      where: {
        NOT: { freelancerId: session.user.id }
      },
      include: {
        freelancer: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })

    // If there aren't enough external services, fetch any services
    if (recommendedServices.length === 0) {
      recommendedServices = await prisma.service.findMany({
        include: {
          freelancer: true,
          reviews: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      })
    }

    topFreelancers = await prisma.user.findMany({
      where: {
        role: 'FREELANCER',
        NOT: { id: session.user.id }
      },
      include: {
        services: true,
        reviewsReceived: true,
      },
      take: 4,
    })

    // If there aren't enough external freelancers, fetch any freelancers
    if (topFreelancers.length === 0) {
      topFreelancers = await prisma.user.findMany({
        where: { role: 'FREELANCER' },
        include: {
          services: true,
          reviewsReceived: true,
        },
        take: 4,
      })
    }
  }

  // -------------------------------------------------------------
  // LOGGED-IN WORKSPACE FEED VIEW (UPWORK / FIVERR STYLE)
  // -------------------------------------------------------------
  if (session && userData) {
    const isFreelancer = userData.role === 'FREELANCER'
    const activeOrders = isFreelancer
      ? userData.ordersAsFreelancer
      : userData.ordersAsClient

    return (
      <main className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
        {/* Background Decorative Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

        {/* Navbar */}
        <Navbar active="home" userName={userData.name} isLoggedIn={true} />

        <div className="max-w-6xl mx-auto px-8 pt-28 pb-10 relative z-10 space-y-8">
          {/* Welcome Feed Hero */}
          <div className="glass-panel rounded-3xl border border-white/5 bg-gradient-to-br from-violet-950/15 via-[#0d0d11]/80 to-[#060608]/90 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none group-hover:scale-110 transition duration-500" />
            
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-4">
                <span className="text-[10px] text-violet-400 font-extrabold bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-accent-pink animate-pulse" /> Ruang Kerja Mahasiswa
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Selamat Datang Kembali, <br />
                  <span className="bg-gradient-to-r from-violet-400 via-accent-pink to-accent-blue bg-clip-text text-transparent">
                    {userData.name.split(' ')[0]}! 👋
                  </span>
                </h1>
                <p className="text-zinc-400 text-sm font-light max-w-xl leading-relaxed">
                  Temukan jasa kreatif terbaik dari ribuan mahasiswa berbakat untuk memajukan proyek Anda, atau mulailah menawarkan keahlian khusus Anda hari ini.
                </p>

                {/* Instant Search Bar */}
                <form action="/services" method="GET" className="flex gap-3 max-w-lg pt-2">
                  <div className="flex-1 relative">
                    <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      name="q"
                      placeholder="Cari jasa pemrograman, desain logo, tulis konten..."
                      className="w-full bg-[#121217]/85 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-violet-600 to-accent-pink text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 transform active:scale-95 cursor-pointer"
                  >
                    Cari Feed
                  </button>
                </form>
              </div>

              {/* Quick Actions Side Panel */}
              <div className="bg-white/2 border border-white/5 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status Akun</h3>
                  <p className="text-sm font-extrabold text-zinc-200 mt-1">{isFreelancer ? 'Freelancer' : 'Klien'}</p>
                </div>
                <div className="border-t border-white/5 pt-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Proyek Berjalan</h3>
                  <p className="text-xl font-extrabold text-violet-400 mt-1">{activeOrders.length} Order Aktif</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/5 hover:border-violet-500/20 text-zinc-300 hover:text-violet-400 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                >
                  Kelola Proyek Saya
                </Link>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-400" /> Kategori Jasa Populer
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { emoji: '💻', name: 'Web Development' },
                { emoji: '🎨', name: 'Desain Grafis' },
                { emoji: '📝', name: 'Penulisan & Konten' },
                { emoji: '🤖', name: 'AI & Machine Learning' },
              ].map((cat, i) => (
                <Link
                  key={i}
                  href={`/services?category=${cat.name}`}
                  className="flex items-center gap-3 p-4 glass-panel rounded-2xl border border-white/5 hover:border-violet-500/30 hover:bg-violet-950/15 hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-md group"
                >
                  <span className="text-2xl filter drop-shadow-[0_4px_6px_rgba(124,58,237,0.15)] group-hover:scale-110 transition duration-300">{cat.emoji}</span>
                  <span className="text-xs font-semibold text-zinc-300 tracking-tight">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Main Marketplace Grid split */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Recommended Feed (Left column - Col span 2) */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse" /> Rekomendasi Jasa Untukmu
                </h2>
                <Link href="/services" className="text-xs text-violet-400 hover:text-violet-300 font-semibold hover:underline">
                  Jelajahi Semua
                </Link>
              </div>

              {recommendedServices.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-500" />
                  <p className="text-sm font-semibold text-zinc-400">Jasa belum tersedia</p>
                  <p className="text-xs text-zinc-500 mt-1 font-light">Jadilah yang pertama menawarkan jasa kreatif Anda!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {recommendedServices.map(svc => {
                    const avgRating =
                      svc.reviews.length > 0
                        ? (
                            svc.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) /
                            svc.reviews.length
                          ).toFixed(1)
                        : null

                    return (
                      <Link
                        key={svc.id}
                        href={`/services/${svc.id}`}
                        className="glass-panel rounded-2xl border border-white/5 overflow-hidden hover:border-violet-500/25 hover:bg-violet-950/5 hover:scale-[1.01] transition-all duration-300 shadow-lg flex flex-col justify-between group"
                      >
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {svc.category}
                            </span>
                            {avgRating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-[10px] text-zinc-300 font-bold">{avgRating}</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-white text-sm line-clamp-1 leading-snug group-hover:text-violet-400 transition duration-200">
                            {svc.title}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-light">
                            {svc.description}
                          </p>
                        </div>

                        <div className="px-5 py-3.5 border-t border-white/5 bg-white/1 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-violet-600/10 border border-violet-500/25 rounded-full flex items-center justify-center">
                              <span className="text-violet-400 text-[10px] font-bold">
                                {svc.freelancer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400 font-light truncate max-w-[80px]">
                              {svc.freelancer.name.split(' ')[0]}
                            </span>
                          </div>
                          <span className="font-extrabold text-violet-400 text-xs">
                            Rp {svc.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Talents and widgets (Right column) */}
            <div className="space-y-6">
              {/* Top Talents Widget */}
              <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl space-y-5">
                <h3 className="font-bold text-white text-sm tracking-tight border-b border-white/5 pb-3 flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-yellow-400" /> Freelancer Terpopuler
                </h3>

                {topFreelancers.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-light text-center py-6">Belum ada freelancer aktif</p>
                ) : (
                  <div className="space-y-4">
                    {topFreelancers.map(fl => {
                      const rating =
                        fl.reviewsReceived.length > 0
                          ? (
                              fl.reviewsReceived.reduce((acc: number, rev: any) => acc + rev.rating, 0) /
                              fl.reviewsReceived.length
                            ).toFixed(1)
                          : null

                      return (
                        <div key={fl.id} className="flex items-center justify-between bg-white/2 border border-white/5 rounded-2xl p-3 hover:border-white/10 transition animate-float" style={{ animationDelay: `-${fl.services.length * 1.5}s` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-violet-600/10 border border-violet-500/20 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-violet-400 text-xs font-bold">
                                {fl.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-200">{fl.name}</h4>
                              <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                                {fl.services.length} Jasa Aktif
                              </p>
                            </div>
                          </div>
                          {rating && (
                            <div className="flex items-center gap-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">
                              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-[9px] text-yellow-400 font-bold">{rating}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Mini Informational Escrow Pitch Widget */}
              <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-violet-900/5 to-cyan-900/5">
                <div className="absolute top-[-30px] right-[-30px] w-20 h-20 rounded-full bg-cyan-600/5 blur-xl pointer-events-none" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" /> Sistem Escrow Aman
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                  Dana Anda dijamin aman di rekening bersama FreelanceKu. Pembayaran baru diteruskan kepada freelancer setelah pekerjaan selesai dan Anda konfirmasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 px-8 py-10 text-center text-sm text-zinc-500 relative z-10 bg-[#060608] mt-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-md flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-zinc-300">FreelanceKu</span>
            </div>
            <div className="text-xs">
              © 2026 FreelanceKu. Platform Talenta Mahasiswa Terpercaya.
            </div>
          </div>
        </footer>
      </main>
    )
  }

  // -------------------------------------------------------------
  // ORIGINAL LOGGED-OUT GUEST LANDING VIEW
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/10 to-violet-500/0 blur-[120px] pointer-events-none" style={{ animationDelay: '-5s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-cyan-500/5 to-blue-500/0 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <Navbar active={session ? 'home' : 'none'} userName={session?.user?.name || undefined} isLoggedIn={!!session} />

      {/* Hero */}
      <section className="px-8 pt-28 pb-20 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-violet-950/45 border border-violet-500/20 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
          <Sparkles className="w-4.5 h-4.5 animate-pulse text-accent-pink" />
          Platform Freelance Mahasiswa Terbesar di Indonesia
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-8 font-sans">
          Temukan Jasa Terbaik <br />
          <span className="bg-gradient-to-r from-violet-400 via-accent-pink to-accent-blue bg-clip-text text-transparent">
            dari Mahasiswa Berbakat
          </span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          FreelanceKu menghubungkan mahasiswa berbakat dengan klien yang membutuhkan jasa desain grafis, coding, penulisan konten, dan masih banyak lagi.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-accent-pink text-white px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] font-bold text-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Masuk Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-accent-pink text-white px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] font-bold text-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Mulai Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <Link
            href="/services"
            className="flex items-center gap-2 glass-panel text-white border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 font-semibold text-lg transition duration-200 cursor-pointer"
          >
            Lihat Jasa
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-20 p-8 glass-panel rounded-3xl border border-white/5 animate-float shadow-xl shadow-black/30">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-white">500+</div>
            <div className="text-xs md:text-sm text-zinc-400 mt-1">Freelancer Aktif</div>
          </div>
          <div className="w-px h-12 bg-white/10 mx-auto self-center" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-white">1.200+</div>
            <div className="text-xs md:text-sm text-zinc-400 mt-1">Proyek Selesai</div>
          </div>
          <div className="w-px h-12 bg-white/10 mx-auto self-center" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-white">98%</div>
            <div className="text-xs md:text-sm text-zinc-400 mt-1">Kepuasan Klien</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-[#0b0b0e]/75 py-24 relative z-10 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-3">Kenapa FreelanceKu?</h2>
          <p className="text-center text-zinc-400 mb-16 max-w-lg mx-auto">Platform freelance yang aman, berdedikasi tinggi, dan didesain ramah pengguna.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6 text-violet-400" />,
                title: 'Pembayaran Sangat Aman',
                desc: 'Dana Anda ditahan aman oleh sistem escrow kami dan hanya dicairkan kepada freelancer setelah pekerjaan selesai dan Anda setujui.'
              },
              {
                icon: <Zap className="w-6 h-6 text-accent-pink" />,
                title: 'Komunikasi Real-Time',
                desc: 'Dilengkapi obrolan langsung real-time terintegrasi untuk mendiskusikan kemajuan proyek Anda kapan saja.'
              },
              {
                icon: <Users className="w-6 h-6 text-accent-blue" />,
                title: 'Mahasiswa Terverifikasi',
                desc: 'Semua talenta kami adalah mahasiswa aktif Indonesia yang telah melalui verifikasi identitas, portofolio, dan rating.'
              }
            ].map((f, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl border border-white/5 glass-panel-hover shadow-lg">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-3">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-8 py-24 max-w-6xl mx-auto relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-3">Kategori Jasa Terpopuler</h2>
        <p className="text-center text-zinc-400 mb-16 max-w-md mx-auto">Telusuri berbagai kategori keahlian terbaik yang ditawarkan oleh para mahasiswa.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '💻', name: 'Web Development' },
            { emoji: '🎨', name: 'Desain Grafis' },
            { emoji: '📝', name: 'Penulisan & Konten' },
            { emoji: '📱', name: 'Mobile App' },
            { emoji: '🎬', name: 'Video & Animasi' },
            { emoji: '📊', name: 'Data & Analisis' },
            { emoji: '🔒', name: 'Keamanan Siber' },
            { emoji: '🤖', name: 'AI & Machine Learning' },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/services?category=${cat.name}`}
              className="flex flex-col items-center gap-4 p-6 glass-panel rounded-2xl border border-white/5 hover:border-violet-500/40 hover:bg-violet-950/20 hover:scale-[1.03] transition-all duration-300 cursor-pointer shadow-md group"
            >
              <span className="text-4xl filter drop-shadow-[0_8px_8px_rgba(124,58,237,0.15)] group-hover:scale-110 transition duration-300">{cat.emoji}</span>
              <span className="text-sm font-semibold text-zinc-200 text-center tracking-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[#0b0b0e]/75 py-24 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-white mb-3">Bagaimana Cara Kerjanya?</h2>
          <p className="text-center text-zinc-400 mb-16 max-w-md mx-auto">Proses transparan dan efisien yang selesai hanya dalam 3 langkah mudah.</p>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {[
              { step: '01', title: 'Cari Jasa Impian', desc: 'Jelajahi ratusan portofolio jasa dari freelancer mahasiswa kreatif kami sesuai kebutuhan spesifik Anda.' },
              { step: '02', title: 'Pesan & Amankan Pembayaran', desc: 'Bayar dengan aman melalui gateway pembayaran kami. Dana Anda akan disimpan aman di rekening bersama.' },
              { step: '03', title: 'Terima Hasil Kerja & Selesai', desc: 'Periksa hasil kerja freelancer. Jika telah sesuai, setujui proyek dan dana akan langsung dicairkan ke freelancer.' },
            ].map((s, i) => (
              <div key={i} className="text-center relative group">
                <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-accent-pink text-white rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg shadow-violet-600/20 group-hover:scale-105 transition duration-300">
                  {s.step}
                </div>
                <h3 className="font-bold text-white text-lg mb-3">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-28 max-w-4xl mx-auto text-center relative z-10">
        <div className="relative p-12 glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-violet-950/20">
          <div className="absolute -top-[50%] -right-[30%] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-[50%] -left-[30%] w-[300px] h-[300px] rounded-full bg-pink-500/10 blur-[80px] pointer-events-none" />

          <h2 className="text-4xl font-extrabold text-white mb-4">Siap untuk Memulai Proyek Anda?</h2>
          <p className="text-zinc-300 mb-8 max-w-lg mx-auto font-light">Gabung sekarang dengan ribuan klien dan mahasiswa kreatif Indonesia di platform kami.</p>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-accent-pink text-white px-10 py-4 rounded-xl hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] font-bold text-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Kembali ke Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-accent-pink text-white px-10 py-4 rounded-xl hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] font-bold text-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-10 text-center text-sm text-zinc-500 relative z-10 bg-[#060608]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-md flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-zinc-300">FreelanceKu</span>
          </div>
          <div>
            © 2026 FreelanceKu. Dibuat dengan ❤️ oleh mahasiswa, untuk mahasiswa.
          </div>
        </div>
      </footer>
    </main>
  )
}