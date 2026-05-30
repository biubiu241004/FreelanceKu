import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { clientId: session.user.id },
        { freelancerId: session.user.id },
      ],
    },
    include: {
      service: true,
      client: true,
      freelancer: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const isFreelancer = session.user.role === 'FREELANCER'

  const statusColor: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    ACCEPTED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    IN_PROGRESS: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    REVISION: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  }

  const statusLabel: Record<string, string> = {
    PENDING: 'Menunggu',
    ACCEPTED: 'Diterima',
    IN_PROGRESS: 'Dikerjakan',
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
        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-extrabold text-white tracking-tight">Daftar Order Saya</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 relative z-10">
        {orders.length === 0 ? (
          <div className="text-center py-24 text-zinc-500 glass-panel rounded-3xl border border-white/5 shadow-xl">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30 animate-pulse" />
            <p className="text-lg font-bold text-zinc-400">Belum ada order</p>
            <p className="text-sm mt-1.5 mb-6 font-light">
              {isFreelancer ? 'Tunggu klien memesan jasamu' : 'Yuk cari jasa yang kamu butuhkan'}
            </p>
            {!isFreelancer && (
              <Link
                href="/services"
                className="inline-block bg-gradient-to-r from-violet-600 to-primary-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-300 transform active:scale-95 cursor-pointer"
              >
                Cari Jasa Sekarang
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="glass-panel rounded-3xl border border-white/5 p-5 flex items-center justify-between hover:border-violet-500/30 hover:bg-violet-950/10 hover:scale-[1.01] transition-all duration-300 block shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-600/10 border border-violet-500/20 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-200 hover:text-white transition text-sm">{order.service.title}</p>
                    <p className="text-xs text-zinc-400 mt-1 font-light">
                      {isFreelancer ? `Klien: ${order.client.name}` : `Freelancer: ${order.freelancer.name}`}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-light">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-violet-400 text-sm mb-2.5">
                    Rp {order.totalPrice.toLocaleString('id-ID')}
                  </p>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusColor[order.status]}`}>
                    {statusLabel[order.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}