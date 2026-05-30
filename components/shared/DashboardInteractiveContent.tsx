'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Briefcase,
  ShoppingBag,
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Wallet,
  ArrowUpRight,
  Activity,
  Search,
  Filter,
  ArrowDownLeft,
  X,
  CreditCard,
  Building,
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react'

interface DashboardInteractiveContentProps {
  isFreelancer: boolean
  userName: string
  totalEarnings: number
  escrowEarnings: number
  totalSpent: number
  escrowSpent: number
  avgRating: string
  totalOrders: number
  completedOrders: number
  servicesCount: number
  reviewsCount: number
  recentOrders: any[]
  services: any[]
  monthlySales: { month: string; amount: number }[]
  monthlyOrders: { month: string; count: number }[]
  walletTransactions?: any[]
}

export default function DashboardInteractiveContent({
  isFreelancer,
  userName,
  totalEarnings,
  escrowEarnings,
  totalSpent,
  escrowSpent,
  avgRating,
  totalOrders,
  completedOrders,
  servicesCount,
  reviewsCount,
  recentOrders,
  services,
  monthlySales,
  monthlyOrders,
  walletTransactions = []
}: DashboardInteractiveContentProps) {
  // State variables
  const [chartTab, setChartTab] = useState<'financial' | 'count'>('financial')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'ESCROW' | 'CANCELLED'>('ALL')
  const [hoverNodeIdx, setHoverNodeIdx] = useState<number | null>(null)
  
  // Wallet modals
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [actionAmount, setActionAmount] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)

  // Computed balance values
  const totalWithdrawals = useMemo(() => {
    return (walletTransactions || [])
      .filter((w: any) => w.status === 'SUCCESS' && w.type === 'WITHDRAWAL')
      .reduce((sum: number, w: any) => sum + w.amount, 0)
  }, [walletTransactions])

  const totalDeposits = useMemo(() => {
    return (walletTransactions || [])
      .filter((w: any) => w.status === 'SUCCESS' && w.type === 'DEPOSIT')
      .reduce((sum: number, w: any) => sum + w.amount, 0)
  }, [walletTransactions])

  const availableBalance = isFreelancer 
    ? Math.max(0, totalEarnings - totalWithdrawals) 
    : Math.max(0, totalDeposits - totalSpent - escrowSpent)

  const escrowBalance = isFreelancer ? escrowEarnings : escrowSpent
  const summaryBalance = isFreelancer ? totalEarnings : totalDeposits

  // Filtered transactions for cashbook
  const transactions = useMemo(() => {
    const orderTx = recentOrders.map(order => {
      const dateStr = new Date(order.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })

      // Determine ledger details
      const isCompleted = order.status === 'COMPLETED'
      const isEscrow = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'REVISION'].includes(order.status)
      const isCancelled = order.status === 'CANCELLED'

      let ledgerStatus: 'COMPLETED' | 'ESCROW' | 'CANCELLED' = 'ESCROW'
      if (isCompleted) ledgerStatus = 'COMPLETED'
      if (isCancelled) ledgerStatus = 'CANCELLED'

      return {
        id: order.id,
        rawId: order.id,
        title: order.service.title,
        date: dateStr,
        createdAt: order.createdAt,
        amount: order.totalPrice,
        partyName: isFreelancer ? order.client.name : order.freelancer.name,
        category: order.service.category,
        ledgerStatus,
        statusLabel: order.status,
        isWalletTx: false,
        type: undefined
      }
    })

    const walletTx = (walletTransactions || []).map((tx: any) => {
      const dateStr = new Date(tx.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })

      return {
        id: tx.id,
        rawId: tx.id,
        title: tx.type === 'DEPOSIT' ? 'Isi Saldo Pay' : tx.type === 'WITHDRAWAL' ? 'Tarik Dana' : tx.note || 'Transaksi Dompet',
        date: dateStr,
        createdAt: tx.createdAt,
        amount: tx.amount,
        partyName: tx.type === 'DEPOSIT' ? 'Virtual Account' : tx.type === 'WITHDRAWAL' ? 'Rekening Bank' : 'Platform',
        category: tx.type === 'DEPOSIT' ? 'Top-Up' : tx.type === 'WITHDRAWAL' ? 'Withdrawal' : 'Transfer',
        ledgerStatus: tx.status === 'SUCCESS' ? 'COMPLETED' : tx.status === 'PENDING' ? 'ESCROW' : 'CANCELLED',
        statusLabel: tx.status,
        isWalletTx: true,
        type: tx.type
      }
    })

    const combined = [...orderTx, ...walletTx]
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [recentOrders, walletTransactions, isFreelancer])

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = statusFilter === 'ALL' || t.ledgerStatus === statusFilter
      return matchesSearch && matchesFilter
    })
  }, [transactions, searchQuery, statusFilter])

  // Dynamic Chart calculations
  const chartData = useMemo(() => {
    if (chartTab === 'financial') {
      return monthlySales.map(d => ({ label: d.month, value: d.amount }))
    } else {
      return monthlyOrders.map(d => ({ label: d.month, value: d.count }))
    }
  }, [chartTab, monthlySales, monthlyOrders])

  const maxChartValue = useMemo(() => {
    const vals = chartData.map(d => d.value)
    const maxVal = Math.max(...vals, 1)
    return chartTab === 'financial' ? Math.max(maxVal, 500000) : Math.max(maxVal, 5)
  }, [chartData, chartTab])

  // Curve points generator for responsive SVG Area Chart
  const svgWidth = 500
  const svgHeight = 160
  const paddingX = 40
  const paddingY = 20

  const chartPoints = useMemo(() => {
    if (chartData.length === 0) return []
    const spacing = (svgWidth - paddingX * 2) / (chartData.length - 1)
    
    return chartData.map((d, i) => {
      const x = paddingX + i * spacing
      const ratio = d.value / maxChartValue
      const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2)
      return { x, y, label: d.label, value: d.value }
    })
  }, [chartData, maxChartValue, svgWidth, svgHeight, paddingX, paddingY])

  // Cubic Bezier curve paths generator
  const bezierPath = useMemo(() => {
    if (chartPoints.length < 2) return ''
    let d = `M ${chartPoints[0].x} ${chartPoints[0].y}`
    
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const p0 = chartPoints[i]
      const p1 = chartPoints[i + 1]
      
      // Control points for smooth bezier curve
      const cpX1 = p0.x + (p1.x - p0.x) / 3
      const cpY1 = p0.y
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3
      const cpY2 = p1.y
      
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`
    }
    return d
  }, [chartPoints])

  const areaPath = useMemo(() => {
    if (chartPoints.length < 2) return ''
    return `${bezierPath} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - paddingY} L ${chartPoints[0].x} ${svgHeight - paddingY} Z`
  }, [bezierPath, chartPoints, svgHeight, paddingY])

  // Handle Withdraw/Top-up Submission
  const handleWalletAction = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = parseFloat(actionAmount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Masukkan jumlah nominal yang valid!')
      return
    }

    if (isFreelancer && numericAmount > availableBalance) {
      toast.error('Saldo tersedia tidak mencukupi untuk penarikan!')
      return
    }

    setIsSubmittingAction(true)

    const endpoint = isFreelancer ? '/api/wallet/withdraw' : '/api/wallet/topup'
    const body = isFreelancer
      ? { amount: numericAmount, bankName, accountNumber }
      : { amount: numericAmount, paymentMethod: 'Virtual Account' }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || 'Terjadi kesalahan saat memproses transaksi')
        }
        toast.success(
          isFreelancer
            ? `Permintaan penarikan Rp ${numericAmount.toLocaleString('id-ID')} berhasil diajukan!`
            : `Top up saldo Rp ${numericAmount.toLocaleString('id-ID')} berhasil!`
        )
        setWalletModalOpen(false)
        setActionAmount('')
        setBankName('')
        setAccountNumber('')
        
        // Memicu reload halaman agar saldo terupdate secara instan dan riil
        window.location.reload()
      })
      .catch((err) => {
        toast.error(err.message || 'Terjadi kesalahan server!')
      })
      .finally(() => {
        setIsSubmittingAction(false)
      })
  }

  return (
    <div className="space-y-8">
      {/* Dynamic Grid: Chart & Wallet */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Main Visual SVG Smooth Area Chart */}
        <div className={`${isFreelancer ? 'md:col-span-2' : 'md:col-span-3'} glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-600/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-violet-400 animate-pulse" />
                {isFreelancer ? 'Ikhtisar Kinerja Penjualan Jasa' : 'Ikhtisar Aktivitas & Pengeluaran'}
              </h2>
              <p className="text-[10px] text-zinc-400 font-light mt-0.5">Analisis pertumbuhan keuangan dalam 6 bulan terakhir</p>
            </div>
            
            {/* Custom Interactive Toggle Tabs */}
            <div className="flex items-center bg-white/2 border border-white/5 p-0.5 rounded-full self-start sm:self-auto">
              <button
                onClick={() => setChartTab('financial')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 ${
                  chartTab === 'financial'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isFreelancer ? 'Pendapatan (Rp)' : 'Pengeluaran (Rp)'}
              </button>
              <button
                onClick={() => setChartTab('count')}
                className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 ${
                  chartTab === 'count'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Transaksi (Pcs)
              </button>
            </div>
          </div>

          {/* SVG Smooth Area Curve Chart */}
          <div className="relative pt-2 h-44">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                {/* Curve gradient */}
                <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                </linearGradient>
                {/* Border line gradient */}
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Horizontal Dotted Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingY + ratio * (svgHeight - paddingY * 2)
                return (
                  <line
                    key={i}
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                )
              })}

              {/* Left Vertical Y-Axis Labels */}
              <text x={paddingX - 10} y={paddingY + 3} fill="#71717a" fontSize="7" fontWeight="extrabold" textAnchor="end">
                {chartTab === 'financial' ? `Rp ${(maxChartValue / 1000).toFixed(0)}K` : maxChartValue}
              </text>
              <text x={paddingX - 10} y={svgHeight / 2 + 3} fill="#71717a" fontSize="7" fontWeight="extrabold" textAnchor="end">
                {chartTab === 'financial' ? `Rp ${(maxChartValue / 2000).toFixed(0)}K` : (maxChartValue / 2).toFixed(0)}
              </text>
              <text x={paddingX - 10} y={svgHeight - paddingY + 3} fill="#71717a" fontSize="7" fontWeight="extrabold" textAnchor="end">
                0
              </text>

              {/* Glowing Area Fill */}
              {areaPath && (
                <path d={areaPath} fill="url(#curveGrad)" className="animate-pulse-glow" />
              )}

              {/* Glowing Smooth Bezier Curve Line */}
              {bezierPath && (
                <path
                  d={bezierPath}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(124,58,237,0.3)]"
                />
              )}

              {/* Interactive Nodes and Month Labels */}
              {chartPoints.map((point, idx) => {
                const isHovered = hoverNodeIdx === idx
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoverNodeIdx(idx)}
                    onMouseLeave={() => setHoverNodeIdx(null)}
                  >
                    {/* Invisible hover-catcher circle */}
                    <circle cx={point.x} cy={point.y} r="16" fill="transparent" />

                    {/* Outer glow ring */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? '8' : '4'}
                      fill={isHovered ? 'rgba(124, 58, 237, 0.25)' : 'rgba(236, 72, 153, 0.1)'}
                      className="transition-all duration-300"
                    />

                    {/* Core Solid Circle Node */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isHovered ? '4.5' : '2.5'}
                      fill={isHovered ? '#f4f4f5' : '#7c3aed'}
                      stroke={isHovered ? '#7c3aed' : '#ffffff'}
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />

                    {/* Hover Tooltip display over nodes */}
                    {isHovered && (
                      <g className="transition duration-300">
                        {/* Tooltip Background Card */}
                        <rect
                          x={point.x - 45}
                          y={point.y - 30}
                          width="90"
                          height="20"
                          rx="6"
                          fill="#0f0f17"
                          stroke="rgba(124,58,237,0.4)"
                          strokeWidth="1"
                        />
                        <text
                          x={point.x}
                          y={point.y - 17}
                          fill="#f4f4f5"
                          fontSize="7.5"
                          fontWeight="extrabold"
                          textAnchor="middle"
                        >
                          {chartTab === 'financial' ? `Rp ${point.value.toLocaleString('id-ID')}` : `${point.value} Order`}
                        </text>
                      </g>
                    )}

                    {/* X-Axis Month label */}
                    <text
                      x={point.x}
                      y={svgHeight - 4}
                      fill={isHovered ? '#ffffff' : '#a1a1aa'}
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="transition duration-150"
                    >
                      {point.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Premium Digital Wallet Card (Freelancer Only) */}
        {isFreelancer && (
          <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden bg-gradient-to-br from-violet-950/20 via-[#0a0a0f] to-zinc-950 flex flex-col justify-between group">
            <div className="absolute top-[-30px] right-[-30px] w-28 h-28 rounded-full bg-violet-600/10 blur-2xl pointer-events-none group-hover:scale-110 transition duration-500" />
            <div className="absolute bottom-[-40px] left-[-40px] w-32 h-32 rounded-full bg-pink-500/5 blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-violet-400 font-extrabold bg-violet-500/15 border border-violet-500/25 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                  <Wallet className="w-3.5 h-3.5" /> Dompet Digital
                </span>
                <span className="text-zinc-500 text-[10px] font-bold tracking-wider">FreelanceKu Pay</span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Saldo Tersedia (Siap Tarik)
                </h3>
                <p className="text-3xl font-extrabold text-white mt-1.5 tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  Rp {availableBalance.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    Total Pendapatan Jasa
                  </h4>
                  <p className="text-xs font-extrabold text-zinc-200 mt-1 flex items-center gap-1">
                    Rp {totalEarnings.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Dana Escrow (Tertahan)</h4>
                  <p className="text-xs font-extrabold text-violet-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Rp {escrowBalance.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                onClick={() => setWalletModalOpen(true)}
                className="w-full bg-gradient-to-r from-violet-600 to-accent-pink text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Tarik Pendapatan <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Block Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Aktivitas Order',
            value: totalOrders,
            icon: <ShoppingBag className="w-5 h-5 text-violet-400" />,
            bg: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            label: 'Pekerjaan Selesai',
            value: completedOrders,
            icon: <Briefcase className="w-5 h-5 text-green-400" />,
            bg: 'bg-green-500/10 border-green-500/20',
          },
          {
            label: 'Reputasi Rating',
            value: avgRating,
            icon: <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />,
            bg: 'bg-yellow-500/10 border-yellow-500/20',
          },
          {
            label: isFreelancer ? 'Jasa Saya Aktif' : 'Ulasan Diberikan',
            value: isFreelancer ? servicesCount : reviewsCount,
            icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
            bg: 'bg-purple-500/10 border-purple-500/20',
          },
        ].map((stat, i) => (
          <div key={i} className="glass-panel rounded-2xl border border-white/5 p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/2 to-white/0 rounded-bl-full pointer-events-none" />
            <div className={`w-10 h-10 ${stat.bg} border rounded-xl flex items-center justify-center mb-4`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-extrabold text-white">{stat.value}</div>
            <div className="text-[10px] text-zinc-400 mt-1.5 font-bold tracking-wide uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Rincian Saldo Masuk & Mutasi Ledger (Buku Kas) */}
      <div className="glass-panel rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-600/2 to-transparent rounded-br-full pointer-events-none" />

        {/* Ledger Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-6">
          <div>
            <h2 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-400" />
              {isFreelancer ? 'Buku Kas & Rincian Saldo Masuk' : 'Buku Transaksi & Rincian Pengeluaran'}
            </h2>
            <p className="text-[10px] text-zinc-400 font-light mt-0.5">
              {isFreelancer
                ? 'Mutasi pencatatan kas masuk yang diterima serta status kliring dana escrow'
                : 'Catatan pengeluaran dana untuk pembelian jasa di platform'}
            </p>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi..."
                className="bg-white/2 border border-white/5 focus:border-violet-500/30 rounded-full pl-9 pr-4 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20 w-44 transition"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center bg-white/2 border border-white/5 p-0.5 rounded-full">
              {(['ALL', 'COMPLETED', 'ESCROW', 'CANCELLED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider transition ${
                    statusFilter === filter
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/25'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {filter === 'ALL' && 'Semua'}
                  {filter === 'COMPLETED' && (isFreelancer ? 'Cair' : 'Selesai')}
                  {filter === 'ESCROW' && 'Escrow'}
                  {filter === 'CANCELLED' && 'Batal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Content */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30 text-zinc-400" />
            <p className="text-sm font-medium">Tidak ada rincian saldo ditemukan</p>
            <p className="text-xs text-zinc-600 mt-1 font-light">Coba ubah kata kunci pencarian atau filter status Anda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Tanggal / ID</th>
                  <th className="pb-3">Jasa / Kategori</th>
                  <th className="pb-3">{isFreelancer ? 'Klien Pembayar' : 'Freelancer Jasa'}</th>
                  <th className="pb-3 text-right">Nominal</th>
                  <th className="pb-3 pr-2 text-right">Status Kliring</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/2">
                {filteredTransactions.map((tx) => {
                  const isCompleted = tx.ledgerStatus === 'COMPLETED'
                  const isEscrow = tx.ledgerStatus === 'ESCROW'
                  const isCancelled = tx.ledgerStatus === 'CANCELLED'

                  return (
                    <tr key={tx.id} className="text-xs group hover:bg-white/2 transition duration-150">
                      {/* Date & ID */}
                      <td className="py-4 pl-2">
                        <p className="font-bold text-zinc-300">{tx.date}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ID: {tx.id.substring(0, 8)}...</p>
                      </td>

                      {/* Title & Category */}
                      <td className="py-4">
                        {tx.isWalletTx ? (
                          <span className="font-bold text-zinc-200 line-clamp-1">
                            {tx.title}
                          </span>
                        ) : (
                          <Link href={`/orders/${tx.rawId}`} className="font-bold text-zinc-200 hover:text-violet-400 hover:underline transition line-clamp-1">
                            {tx.title}
                          </Link>
                        )}
                        <span className="text-[8px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/15 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                          {tx.category}
                        </span>
                      </td>

                      {/* Party Name */}
                      <td className="py-4 font-semibold text-zinc-300">
                        {tx.partyName}
                      </td>

                      {/* Cashflow Amount */}
                      <td className="py-4 text-right">
                        {(() => {
                          let isPlus = false
                          let colorClass = 'text-rose-400'
                          
                          if (tx.isWalletTx) {
                            if (tx.type === 'DEPOSIT') {
                              isPlus = true
                              colorClass = 'text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.15)]'
                            } else if (tx.type === 'WITHDRAWAL') {
                              isPlus = false
                              colorClass = 'text-rose-400'
                            }
                          } else {
                            if (isFreelancer) {
                              isPlus = true
                              colorClass = isCancelled
                                ? 'text-zinc-500 line-through'
                                : 'text-emerald-400 filter drop-shadow-[0_0_6px_rgba(52,211,153,0.15)]'
                            } else {
                              isPlus = false
                              colorClass = isCancelled
                                ? 'text-zinc-500 line-through'
                                : 'text-rose-400'
                            }
                          }

                          return (
                            <span className={`font-extrabold text-sm ${colorClass}`}>
                              {isPlus ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                            </span>
                          )
                        })()}
                      </td>

                      {/* Escrow Status Pills */}
                      <td className="py-4 text-right pr-2">
                        {isCompleted && (
                          <span className="text-[8px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 inline-flex items-center gap-1 shadow-sm">
                            <span className="w-1 h-1 rounded-full bg-green-400" />
                            {isFreelancer ? 'Cair & Tersedia' : 'Sukses Selesai'}
                          </span>
                        )}
                        {isEscrow && (
                          <span className="text-[8px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 inline-flex items-center gap-1 shadow-sm animate-pulse">
                            <span className="w-1 h-1 rounded-full bg-yellow-400 animate-ping" />
                            Escrow (Tertahan)
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-[8px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-red-400" />
                            {isFreelancer ? 'Dibatalkan' : 'Refund Lunas'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Content Layout Split */}
      <div className={isFreelancer ? "grid md:grid-cols-3 gap-8" : ""}>
        
        {/* Recent Transaction Activity Panel */}
        <div className={isFreelancer ? "md:col-span-2 glass-panel rounded-3xl border border-white/5 p-6 h-fit shadow-xl" : "glass-panel rounded-3xl border border-white/5 p-6 shadow-xl"}>
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-violet-400" /> Transaksi & Order Terbaru
            </h2>
            <Link href="/orders" className="text-xs text-violet-400 hover:text-violet-300 font-semibold hover:underline">
              Lihat semua
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">Belum ada aktivitas order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => {
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
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-4 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition block group/order"
                  >
                    <div>
                      <p className="font-bold text-zinc-200 text-sm group-hover/order:text-violet-400 transition">
                        {order.service.title}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1.5 font-light">
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                        {isFreelancer ? `Klien: ${order.client.name}` : `Talenta: ${order.freelancer.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-violet-400 text-sm">
                        Rp {order.totalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Jasa Saya Side-List (Freelancer Only) */}
        {isFreelancer && (
          <div className="glass-panel rounded-3xl border border-white/5 p-6 h-fit shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="font-bold text-white text-base">Katalog Jasa Saya</h2>
              <Link
                href="/services/create"
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-sm mb-4">Kamu belum menambahkan jasa</p>
                <Link
                  href="/services/create"
                  className="inline-block bg-violet-600/10 border border-violet-500/20 text-violet-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-violet-600/20 transition"
                >
                  Tambah Jasa
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(svc => (
                  <div key={svc.id} className="p-4 bg-white/2 border border-white/5 rounded-2xl space-y-4">
                    <div>
                      <h3 className="font-bold text-zinc-200 text-sm line-clamp-1">{svc.title}</h3>
                      <span className="text-[9px] text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full mt-2 inline-block">
                        {svc.category}
                      </span>
                      <p className="text-sm font-extrabold text-zinc-300 mt-2">Rp {svc.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/services/${svc.id}`}
                        className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 py-2 rounded-xl text-[10px] font-bold transition cursor-pointer"
                      >
                        Lihat
                      </Link>
                      <Link
                        href={`/services/${svc.id}/edit`}
                        className="flex-1 text-center bg-gradient-to-r from-violet-600 to-accent-pink text-white py-2 rounded-xl text-[10px] font-bold hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] transition cursor-pointer"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Wallet Action Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md glass-panel rounded-3xl border border-violet-500/25 bg-[#0a0a0f] p-6 shadow-2xl space-y-6 overflow-hidden animate-scale-up">
            <div className="absolute top-[-30%] left-[-30%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[80px] pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4 relative z-10">
              <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-400" />
                {isFreelancer ? 'Tarik Pendapatan Ke Rekening' : 'Top Up Saldo Pay'}
              </h3>
              <button
                onClick={() => setWalletModalOpen(false)}
                className="text-zinc-500 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWalletAction} className="space-y-4 relative z-10">
              <div className="bg-white/3 border border-white/5 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Saldo Tersedia</p>
                  <p className="text-base font-extrabold text-zinc-200 mt-1">Rp {availableBalance.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Escrow Tertahan</p>
                  <p className="text-base font-bold text-violet-400 mt-1">Rp {escrowBalance.toLocaleString('id-ID')}</p>
                </div>
              </div>

              {/* Account Details for withdraw */}
              {isFreelancer ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-zinc-500" /> Bank / E-Wallet Tujuan
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                      className="w-full bg-white/2 hover:bg-white/4 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/30 transition cursor-pointer"
                    >
                      <option value="" disabled className="bg-zinc-950 text-zinc-500">Pilih Rekening Tujuan...</option>
                      <option value="BCA" className="bg-zinc-950 text-zinc-200">Bank Central Asia (BCA)</option>
                      <option value="MANDIRI" className="bg-zinc-950 text-zinc-200">Bank Mandiri</option>
                      <option value="BNI" className="bg-zinc-950 text-zinc-200">Bank Negara Indonesia (BNI)</option>
                      <option value="GOPAY" className="bg-zinc-950 text-zinc-200">GoPay (E-Wallet)</option>
                      <option value="OVO" className="bg-zinc-950 text-zinc-200">OVO (E-Wallet)</option>
                      <option value="DANA" className="bg-zinc-950 text-zinc-200">DANA (E-Wallet)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nomor Rekening / No. HP</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 8290391039 atau 0812xxxxxx"
                      required
                      className="w-full bg-white/2 hover:bg-white/4 border border-white/5 focus:border-violet-500/40 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition placeholder-zinc-500 font-light"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Metode Pembayaran Virtual Account</label>
                  <select
                    required
                    className="w-full bg-white/2 hover:bg-white/4 border border-white/5 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/30 transition cursor-pointer"
                  >
                    <option value="BCA_VA" className="bg-zinc-950 text-zinc-200">BCA Virtual Account</option>
                    <option value="MANDIRI_VA" className="bg-zinc-950 text-zinc-200">Mandiri Bill Payment</option>
                    <option value="BNI_VA" className="bg-zinc-950 text-zinc-200">BNI Virtual Account</option>
                    <option value="QRIS" className="bg-zinc-950 text-zinc-200">QRIS Instan (Gopay/OVO/Dana)</option>
                  </select>
                </div>
              )}

              {/* Amount input */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-zinc-400">Rp</span>
                  <input
                    type="number"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    placeholder="Contoh: 100000"
                    required
                    min="10000"
                    className="w-full bg-white/2 hover:bg-white/4 border border-white/5 focus:border-violet-500/40 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition placeholder-zinc-500 font-semibold"
                  />
                </div>
                <p className="text-[8px] text-zinc-500 font-light pl-1">
                  *Minimal {isFreelancer ? 'penarikan' : 'isi saldo'} adalah Rp 10.000
                </p>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={isSubmittingAction}
                className="w-full bg-gradient-to-r from-violet-600 to-accent-pink text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] transition duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingAction ? (
                  'Memproses transaksi...'
                ) : (
                  <>
                    {isFreelancer ? 'Tarik Dana Sekarang' : 'Bayar Isi Saldo'} <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
