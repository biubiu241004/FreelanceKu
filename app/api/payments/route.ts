import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { orderId } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        service: true,
      },
    })

    if (!order) {
      return NextResponse.json({ message: 'Order tidak ditemukan!' }, { status: 404 })
    }

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: order.totalPrice,
      },
      customer_details: {
        first_name: order.client.name,
        email: order.client.email,
      },
      item_details: [
        {
          id: order.service.id,
          price: order.totalPrice,
          quantity: 1,
          name: order.service.title.substring(0, 50),
        },
      ],
    }

    const transaction = await snap.createTransaction(parameter)

    // Simpan snap token ke database
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        snapToken: transaction.token,
        snapUrl: transaction.redirect_url,
        status: 'PENDING',
      },
      create: {
        orderId: order.id,
        amount: order.totalPrice,
        snapToken: transaction.token,
        snapUrl: transaction.redirect_url,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}