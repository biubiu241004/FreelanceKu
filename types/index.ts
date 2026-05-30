export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REVISION'

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'RELEASED'
  | 'REFUNDED'

export interface ServiceCard {
  id: string
  title: string
  description: string
  price: number
  category: string
  image?: string
  freelancer: {
    id: string
    name: string
    avatar?: string
  }
  reviews: {
    rating: number
  }[]
}