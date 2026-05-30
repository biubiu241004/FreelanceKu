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

    const { amount, paymentMethod } = await req.json()
    const numericAmount = parseFloat(amount)

    if (isNaN(numericAmount) || numericAmount < 10000) {
      return NextResponse.json(
        { message: 'Nominal top up minimal Rp 10.000!' },
        { status: 400 }
      )
    }

    const methodLabel = paymentMethod || 'Virtual Account'

    // Buat WalletTransaction baru
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        amount: numericAmount,
        type: 'DEPOSIT',
        status: 'SUCCESS',
        note: `Top up saldo via ${methodLabel}`
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error in topup route:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}
