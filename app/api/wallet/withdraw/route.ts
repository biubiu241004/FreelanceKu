import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { amount, bankName, accountNumber } = await req.json()
    const numericAmount = parseFloat(amount)

    if (isNaN(numericAmount) || numericAmount < 10000) {
      return NextResponse.json(
        { message: 'Nominal penarikan minimal Rp 10.000!' },
        { status: 400 }
      )
    }

    if (!bankName || !accountNumber) {
      return NextResponse.json(
        { message: 'Bank tujuan dan nomor rekening harus diisi!' },
        { status: 400 }
      )
    }

    // Hitung Saldo Tersedia Freelancer
    const completedOrders = await prisma.order.findMany({
      where: {
        freelancerId: session.user.id,
        status: 'COMPLETED'
      }
    })
    const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0)

    const successfulWithdrawals = await prisma.walletTransaction.findMany({
      where: {
        userId: session.user.id,
        type: 'WITHDRAWAL',
        status: 'SUCCESS'
      }
    })
    const totalWithdrawals = successfulWithdrawals.reduce((sum, w) => sum + w.amount, 0)

    const availableBalance = totalEarnings - totalWithdrawals

    if (numericAmount > availableBalance) {
      return NextResponse.json(
        { message: 'Saldo tersedia tidak mencukupi untuk melakukan penarikan!' },
        { status: 400 }
      )
    }

    // Buat WalletTransaction baru
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        amount: numericAmount,
        type: 'WITHDRAWAL',
        status: 'SUCCESS',
        note: `Tarik dana ke ${bankName} - ${accountNumber}`
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error in withdraw route:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}
