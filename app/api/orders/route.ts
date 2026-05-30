import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ hasActiveOrders: false })
    }

    const activeCount = await prisma.order.count({
      where: {
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ],
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'REVISION']
        }
      }
    })

    return NextResponse.json({ hasActiveOrders: activeCount > 0 })
  } catch (error) {
    console.error('Error fetching active orders count:', error)
    return NextResponse.json({ hasActiveOrders: false })
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { serviceId, freelancerId, note, totalPrice } = await req.json()

    if (!serviceId || !freelancerId || totalPrice === undefined) {
      return NextResponse.json(
        { message: 'Data order tidak lengkap!' },
        { status: 400 }
      )
    }

    const order = await prisma.order.create({
      data: {
        serviceId,
        clientId: session.user.id,
        freelancerId,
        note,
        totalPrice,
        status: 'PENDING',
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}