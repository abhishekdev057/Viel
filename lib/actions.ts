"use server"

import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"
import type { Submission } from "@/lib/types"
import { hasUserSubmitted } from "@/lib/submissions"

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json")
const CURRENT_LOGO_FILE = path.join(process.cwd(), "data", "current_logo.json")

// Helper function to get the current session
async function getSession() {
  const cookieStore = await  cookies()
  return getToken({
    req: { cookies: cookieStore } as any,
    secret: process.env.NEXTAUTH_SECRET,
  })
}

// Create a new submission
export async function createSubmission(data: {
  name: string
  description: string
  logoUrl: string
  userEmail: string
  userName: string
  userImage: string | null
}) {
  const token = await getSession()

  if (!token) {
    throw new Error("You must be signed in to submit")
  }

  // Check if user has already submitted
  const alreadySubmitted = await hasUserSubmitted(data.userEmail)
  if (alreadySubmitted) {
    throw new Error("You have already submitted a branding idea")
  }

  // Read existing submissions
  let submissions: Submission[] = []
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8")
    submissions = JSON.parse(fileData)
  } catch (error) {
    // File doesn't exist or is invalid, create a new array
    submissions = []
  }

  // Create new submission
  const newSubmission: Submission = {
    id: uuidv4(),
    name: data.name,
    description: data.description,
    logoUrl: data.logoUrl,
    userEmail: data.userEmail,
    userName: data.userName,
    userImage: data.userImage,
    status: "pending",
    likes: 0,
    dislikes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Add to submissions array
  submissions.push(newSubmission)

  // Write back to file
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2))

  revalidatePath("/")
  return newSubmission
}

// Approve a submission
export async function approveSubmission(id: string) {
  const token = await getSession()

  if (!token || token.email !== "abhishekdev057@gmail.com") {
    throw new Error("Unauthorized")
  }

  // Read existing submissions
  let submissions: Submission[] = []
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8")
    submissions = JSON.parse(fileData)
  } catch (error) {
    throw new Error("Failed to read submissions")
  }

  // Find and update submission
  const updatedSubmissions = submissions.map((submission) => {
    if (submission.id === id) {
      return {
        ...submission,
        status: "approved",
        updatedAt: new Date().toISOString(),
      }
    }
    return submission
  })

  // Write back to file
  await fs.writeFile(DATA_FILE, JSON.stringify(updatedSubmissions, null, 2))

  revalidatePath("/")
  revalidatePath("/admin")
}

// Reject a submission
export async function rejectSubmission(id: string) {
  const token = await getSession()

  if (!token || token.email !== "abhishekdev057@gmail.com") {
    throw new Error("Unauthorized")
  }

  // Read existing submissions
  let submissions: Submission[] = []
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8")
    submissions = JSON.parse(fileData)
  } catch (error) {
    throw new Error("Failed to read submissions")
  }

  // Find and update submission
  const updatedSubmissions = submissions.map((submission) => {
    if (submission.id === id) {
      return {
        ...submission,
        status: "rejected",
        updatedAt: new Date().toISOString(),
      }
    }
    return submission
  })

  // Write back to file
  await fs.writeFile(DATA_FILE, JSON.stringify(updatedSubmissions, null, 2))

  revalidatePath("/")
  revalidatePath("/admin")
}

// Like a submission
export async function likeSubmission(id: string) {
  const token = await getSession()

  if (!token) {
    throw new Error("You must be signed in to like submissions")
  }

  // Read existing submissions
  let submissions: Submission[] = []
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8")
    submissions = JSON.parse(fileData)
  } catch (error) {
    throw new Error("Failed to read submissions")
  }

  // Find and update submission
  const updatedSubmissions = submissions.map((submission) => {
    if (submission.id === id) {
      return {
        ...submission,
        likes: (submission.likes || 0) + 1,
        updatedAt: new Date().toISOString(),
      }
    }
    return submission
  })

  // Write back to file
  await fs.writeFile(DATA_FILE, JSON.stringify(updatedSubmissions, null, 2))

  revalidatePath("/")
}

// Dislike a submission
export async function dislikeSubmission(id: string) {
  const token = await getSession()

  if (!token) {
    throw new Error("You must be signed in to dislike submissions")
  }

  // Read existing submissions
  let submissions: Submission[] = []
  try {
    const fileData = await fs.readFile(DATA_FILE, "utf-8")
    submissions = JSON.parse(fileData)
  } catch (error) {
    throw new Error("Failed to read submissions")
  }

  // Find and update submission
  const updatedSubmissions = submissions.map((submission) => {
    if (submission.id === id) {
      return {
        ...submission,
        dislikes: (submission.dislikes || 0) + 1,
        updatedAt: new Date().toISOString(),
      }
    }
    return submission
  })

  // Write back to file
  await fs.writeFile(DATA_FILE, JSON.stringify(updatedSubmissions, null, 2))

  revalidatePath("/")
}

// Like current logo
export async function likeCurrentLogo() {
  const token = await getSession()

  if (!token) {
    throw new Error("You must be signed in to like")
  }

  // Read current logo stats
  let stats: any = {}
  try {
    const fileData = await fs.readFile(CURRENT_LOGO_FILE, "utf-8")
    stats = JSON.parse(fileData)
  } catch (error) {
    stats = { likes: 0, dislikes: 0, userActions: {} }
  }

  const userEmail = token.email as string
  const userAction = stats.userActions?.[userEmail]

  // Update stats
  if (!userAction) {
    stats.likes = (stats.likes || 0) + 1
    stats.userActions = {
      ...(stats.userActions || {}),
      [userEmail]: "like",
    }
  } else if (userAction === "dislike") {
    stats.likes = (stats.likes || 0) + 1
    stats.dislikes = Math.max(0, (stats.dislikes || 0) - 1)
    stats.userActions[userEmail] = "like"
  }

  // Write back to file
  await fs.writeFile(CURRENT_LOGO_FILE, JSON.stringify(stats, null, 2))

  revalidatePath("/")
}

// Dislike current logo
export async function dislikeCurrentLogo() {
  const token = await getSession()

  if (!token) {
    throw new Error("You must be signed in to dislike")
  }

  // Read current logo stats
  let stats: any = {}
  try {
    const fileData = await fs.readFile(CURRENT_LOGO_FILE, "utf-8")
    stats = JSON.parse(fileData)
  } catch (error) {
    stats = { likes: 0, dislikes: 0, userActions: {} }
  }

  const userEmail = token.email as string
  const userAction = stats.userActions?.[userEmail]

  // Update stats
  if (!userAction) {
    stats.dislikes = (stats.dislikes || 0) + 1
    stats.userActions = {
      ...(stats.userActions || {}),
      [userEmail]: "dislike",
    }
  } else if (userAction === "like") {
    stats.dislikes = (stats.dislikes || 0) + 1
    stats.likes = Math.max(0, (stats.likes || 0) - 1)
    stats.userActions[userEmail] = "dislike"
  }

  // Write back to file
  await fs.writeFile(CURRENT_LOGO_FILE, JSON.stringify(stats, null, 2))

  revalidatePath("/")
}
