import fs from "fs/promises"
import path from "path"
import type { Submission } from "./types"

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json")
const CURRENT_LOGO_FILE = path.join(process.cwd(), "data", "current_logo.json")

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Ensure uploads directory exists
async function ensureUploadsDir() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }
}

// Initialize files if they don't exist
async function initializeFiles() {
  await ensureDataDir()
  await ensureUploadsDir()

  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]))
  }

  try {
    await fs.access(CURRENT_LOGO_FILE)
  } catch {
    await fs.writeFile(
      CURRENT_LOGO_FILE,
      JSON.stringify({
        likes: 0,
        dislikes: 0,
        userActions: {},
      }),
    )
  }
}

// Get all submissions
export async function getSubmissions(): Promise<Submission[]> {
  await initializeFiles()

  const data = await fs.readFile(DATA_FILE, "utf-8")
  const submissions: Submission[] = JSON.parse(data)

  // Only return approved submissions or sort by status and date
  return submissions
    .filter((s) => s.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Get pending submissions
export async function getPendingSubmissions(): Promise<Submission[]> {
  await initializeFiles()

  const data = await fs.readFile(DATA_FILE, "utf-8")
  const submissions: Submission[] = JSON.parse(data)

  return submissions
    .filter((s) => s.status === "pending")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Get approved submissions
export async function getApprovedSubmissions(): Promise<Submission[]> {
  await initializeFiles()

  const data = await fs.readFile(DATA_FILE, "utf-8")
  const submissions: Submission[] = JSON.parse(data)

  return submissions
    .filter((s) => s.status === "approved")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Check if user has already submitted
export async function hasUserSubmitted(email: string): Promise<boolean> {
  await initializeFiles()

  const data = await fs.readFile(DATA_FILE, "utf-8")
  const submissions: Submission[] = JSON.parse(data)

  return submissions.some((s) => s.userEmail === email && s.status !== "rejected")
}

// Get current logo stats
export async function getCurrentLogoStats() {
  await initializeFiles()

  const data = await fs.readFile(CURRENT_LOGO_FILE, "utf-8")
  return JSON.parse(data)
}

// Update current logo stats
export async function updateCurrentLogoStats(stats: any) {
  await initializeFiles()
  await fs.writeFile(CURRENT_LOGO_FILE, JSON.stringify(stats, null, 2))
}
