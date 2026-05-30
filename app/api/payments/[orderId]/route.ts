import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { status } = await req.json()
    const { orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ message: 'Order tidak ditemukan!' }, { status: 404 })
    }

    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: { status },
      create: {
        orderId,
        amount: order.totalPrice,
        status,
      },
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}