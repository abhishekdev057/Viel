export interface Submission {
  id: string
  name: string
  description: string
  logoUrl: string
  userEmail: string
  userName: string
  userImage: string | null
  status: "pending" | "approved" | "rejected"
  likes: number
  dislikes: number
  createdAt: string
  updatedAt: string
}
