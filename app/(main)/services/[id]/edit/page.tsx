import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Star, Edit3 } from 'lucide-react'
import EditServiceForm from '@/components/shared/EditServiceForm'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { id } = await params

  const service = await prisma.service.findUnique({
    where: { id },
  })

  if (!service) notFound()

  // Make sure only the owner can edit
  if (service.freelancerId !== session.user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#f4f4f5] relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-violet-600/10 to-indigo-600/0 blur-[120px] pointer-events-none animate-ambient" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-500/5 to-violet-500/0 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="bg-[#060608]/75 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/25">
              <Star className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Freelance<span className="text-violet-500">Ku</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition">Home</Link>
          <Link href="/dashboard" className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition">Dashboard</Link>
          <Link href="/services" className="text-sm text-zinc-400 hover:text-white transition">Jasa</Link>
          <Link href="/orders" className="text-sm text-zinc-400 hover:text-white transition">Order</Link>
          <Link href="/profile" className="text-sm text-zinc-400 hover:text-white transition">Profil</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12 relative z-10">
        <div className="glass-panel rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-600/10 border border-violet-500/25 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/10">
              <Edit3 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-2xl text-white tracking-tight">Edit Jasa Anda</h2>
              <p className="text-xs text-zinc-400 mt-1 font-light">Perbarui rincian harga, kategori, dan deskripsi penawaran jasa Anda.</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6">
            <EditServiceForm service={service} />
          </div>
        </div>
      </div>
    </div>
  )
}
