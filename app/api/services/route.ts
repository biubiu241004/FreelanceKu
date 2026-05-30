import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        freelancer: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    if (session.user.role !== 'FREELANCER') {
      return NextResponse.json(
        { message: 'Hanya freelancer yang bisa menambah jasa!' },
        { status: 403 }
      )
    }

    const { title, description, price, category } = await req.json()

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { message: 'Semua field harus diisi!' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        category,
        freelancerId: session.user.id,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan server!' },
      { status: 500 }
    )
  }
}