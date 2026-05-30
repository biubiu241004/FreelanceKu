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

    const { orderId, rating, comment } = await req.json()

    if (!orderId || !rating) {
      return NextResponse.json(
        { message: 'ID Order dan rating wajib diisi!' },
        { status: 400 }
      )
    }

    // Cari order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true }
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order tidak ditemukan!' },
        { status: 404 }
      )
    }

    // Cek apakah pengirim adalah client dari order tersebut
    if (order.clientId !== session.user.id) {
      return NextResponse.json(
        { message: 'Hanya klien yang dapat memberikan ulasan!' },
        { status: 403 }
      )
    }

    // Cek apakah order sudah COMPLETED dan dana sudah RELEASED
    if (order.status !== 'COMPLETED' || order.payment?.status !== 'RELEASED') {
      return NextResponse.json(
        { message: 'Anda hanya dapat memberikan ulasan pada pesanan yang sudah selesai dan dicairkan!' },
        { status: 400 }
      )
    }

    // Cek apakah ulasan untuk jasa ini dari klien ini sudah pernah dibuat sebelumnya
    const existingReview = await prisma.review.findFirst({
      where: {
        serviceId: order.serviceId,
        reviewerId: order.clientId,
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { message: 'Anda sudah memberikan ulasan untuk jasa ini!' },
        { status: 400 }
      )
    }

    // Buat ulasan baru
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment || '',
        serviceId: order.serviceId,
        reviewerId: order.clientId,
        reviewedId: order.freelancerId,
      }
    })

    return NextResponse.json(
      { message: 'Ulasan berhasil disimpan dan reputasi aktif!', review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server saat menyimpan ulasan!' },
      { status: 500 }
    )
  }
}
