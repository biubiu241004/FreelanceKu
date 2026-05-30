'use client'

import Link from 'next/link'
import { Zap, Menu, X, Star } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar({
  active,
  userName,
  isLoggedIn = true,
}: {
  active: 'home' | 'dashboard' | 'services' | 'orders' | 'profile' | 'none'
  userName?: string
  isLoggedIn?: boolean
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hasActiveOrders, setHasActiveOrders] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.hasActiveOrders === 'boolean') {
            setHasActiveOrders(data.hasActiveOrders)
          }
        })
        .catch(err => console.error('Error checking active orders:', err))
    }
  }, [isLoggedIn])

  const links = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { id: 'services', label: 'Jasa', href: '/services' },
    { id: 'orders', label: 'Order', href: '/orders' },
    { id: 'profile', label: 'Profil', href: '/profile' },
  ]

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 glass-panel rounded-full bg-[#060608]/70 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-6 py-2.5 transition-all duration-300 hover:border-violet-500/25 hover:shadow-[0_10px_30px_rgba(124,58,237,0.06)]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 select-none">
          <div className="w-7 h-7 bg-gradient-to-tr from-violet-600 to-accent-pink rounded-full flex items-center justify-center shadow-md shadow-violet-600/20">
            <Zap className="w-3.5 h-3.5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Freelance<span className="text-violet-500">Ku</span>
          </span>
        </Link>

        {/* Desktop Links (Apple-style pill container) */}
        <div className="hidden md:flex items-center gap-1 bg-white/2 border border-white/5 rounded-full p-1 shadow-inner">
          {links.map(link => {
            const isActive = active === link.id
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-300 flex items-center gap-1.5 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-primary-600 text-white shadow-md shadow-violet-600/15 scale-102'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                {link.id === 'orders' && hasActiveOrders && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-violet-600/10 border border-violet-500/25 rounded-full flex items-center justify-center shadow-md shadow-violet-600/5 hover:border-violet-500/40 transition duration-300 cursor-pointer">
                <span className="text-violet-400 text-xs font-extrabold">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-zinc-400 hover:text-white transition p-1 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-xs text-zinc-300 hover:text-white font-semibold transition">
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-xs bg-gradient-to-r from-violet-600 to-accent-pink text-white px-4 py-2 rounded-full hover:shadow-[0_0_15px_rgba(124,58,237,0.35)] font-bold transition-all duration-300"
              >
                Daftar
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-zinc-400 hover:text-white transition p-1 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer (Glassmorphic Slidedown) */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 md:hidden glass-panel rounded-3xl border border-white/10 bg-[#060608]/90 backdrop-blur-2xl p-6 shadow-2xl space-y-4 animate-ambient">
          <div className="flex flex-col gap-2">
            {links.map(link => {
              const isActive = active === link.id
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all duration-200 border ${
                    isActive
                      ? 'bg-violet-600/10 border-violet-500/20 text-violet-400'
                      : 'bg-white/1 border-white/5 text-zinc-300 hover:bg-white/3'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.id === 'orders' && hasActiveOrders && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse" />
                    )}
                  </span>
                  {isActive && <Star className="w-4 h-4 text-violet-400 fill-violet-400" />}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
