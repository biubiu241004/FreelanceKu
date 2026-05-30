import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Star, Search, Sparkles } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const session = await getServerSession(authOptions)
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams?.category
  const q = resolvedSearchParams?.q

  const services = await prisma.service.findMany({
    where: {
      ...(category && { category: category }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      freelancer: true,
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  })

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

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <Navbar active="services" userName={session?.user?.name || undefined} isLoggedIn={!!session} />

      <div className="max-w-6xl mx-auto px-8 pt-28 pb-8 relative z-10">
        {/* Search & Filter */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-6">Jelajahi Jasa Kreatif</h1>

          {/* Search */}
          <form className="flex gap-3 mb-8">
            <div className="flex-1 relative">
              <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari jasa yang Anda butuhkan (contoh: Website, Logo)..."
                className="w-full bg-white/3 border border-white/5 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-primary-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Cari Jasa
            </button>
          </form>

          {/* Categories */}
          <div className="flex gap-2.5 flex-wrap">
            <Link
              href="/services"
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                !category
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-white/3 border-white/5 text-zinc-300 hover:border-white/15 hover:bg-white/6'
              }`}
            >
              Semua Kategori
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                href={`/services?category=${cat}`}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                  category === cat
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                    : 'bg-white/3 border-white/5 text-zinc-300 hover:border-white/15 hover:bg-white/6'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 glass-panel rounded-3xl border border-white/5 shadow-xl">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30 animate-pulse" />
            <p className="text-lg font-bold text-zinc-400">Jasa tidak ditemukan</p>
            <p className="text-sm mt-1.5 font-light">Coba gunakan kata kunci atau kategori lain</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const avgRating =
                service.reviews.length > 0
                  ? (
                      service.reviews.reduce((a, b) => a + b.rating, 0) /
                      service.reviews.length
                    ).toFixed(1)
                  : null

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="glass-panel rounded-3xl border border-white/5 overflow-hidden glass-panel-hover shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Image placeholder */}
                    <div className="h-44 bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border-b border-white/5 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition duration-300" />
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <span className="text-6xl filter drop-shadow-[0_8px_12px_rgba(124,58,237,0.2)] group-hover:scale-110 transition duration-300">
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

                    <div className="p-5">
                      <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {service.category}
                      </span>
                      <h3 className="font-bold text-white mt-4 mb-2 line-clamp-2 leading-snug group-hover:text-violet-400 transition duration-200">
                        {service.title}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed font-light">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-violet-600/10 border border-violet-500/25 rounded-full flex items-center justify-center">
                        <span className="text-violet-400 text-[10px] font-bold">
                          {service.freelancer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-300 font-medium">
                        {service.freelancer.name.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-right">
                      {avgRating && (
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-zinc-300 font-bold">{avgRating}</span>
                        </div>
                      )}
                      <p className="font-extrabold text-violet-400 text-sm">
                        Rp {service.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}