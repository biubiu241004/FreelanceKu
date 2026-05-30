import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await prisma.service.findUnique({
      where: { id },
      include: { freelancer: true },
    })

    if (!service) {
      return NextResponse.json({ message: 'Jasa tidak ditemukan!' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Terjadi kesalahan server!' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { id } = await params
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ message: 'Jasa tidak ditemukan!' }, { status: 404 })
    }

    if (service.freelancerId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden!' }, { status: 403 })
    }

    const { title, description, price, category } = await req.json()

    if (!title || !description || price === undefined || !category) {
      return NextResponse.json({ message: 'Semua field harus diisi!' }, { status: 400 })
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Terjadi kesalahan server!' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized!' }, { status: 401 })
    }

    const { id } = await params
    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ message: 'Jasa tidak ditemukan!' }, { status: 404 })
    }

    if (service.freelancerId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden!' }, { status: 403 })
    }

    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Jasa berhasil dihapus!' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Terjadi kesalahan server!' }, { status: 500 })
  }
}
