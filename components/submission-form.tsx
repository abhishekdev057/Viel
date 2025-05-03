"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { createSubmission } from "@/lib/actions"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function SubmissionForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/gif"]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, SVG, or GIF image.")
      return
    }

    // Check file size (2MB max)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File too large. Maximum size is 2MB.")
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your idea",
        variant: "destructive",
      })
      return
    }

    if (!file) {
      setError("Please upload a logo image")
      return
    }

    setIsSubmitting(true)

    try {
      // Upload file first
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const error = await uploadRes.json()
        throw new Error(error.error || "Failed to upload file")
      }

      const { fileName } = await uploadRes.json()

      // Create submission
      await createSubmission({
        name,
        description,
        logoUrl: fileName,
        userEmail: session.user?.email!,
        userName: session.user?.name || "Anonymous",
        userImage: session.user?.image || null,
      })

      toast({
        title: "Submission successful!",
        description: "Your branding idea has been submitted for approval.",
      })

      // Reset form
      setName("")
      setDescription("")
      setFile(null)
      setPreview(null)

      // Refresh the page to show the new submission
      router.refresh()
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Sign in to submit your idea</h3>
        <p className="mb-6 text-gray-600">You need to sign in with Google to submit your branding suggestion.</p>
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      </div>
    )
  }

  return (
    <Card className="max-w-3xl mx-auto p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name Suggestion</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your suggested name"
                required
              />
            </div>

            <div>
              <Label htmlFor="logo">Upload Your Logo</Label>
              <div className="mt-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                  {preview ? (
                    <div className="relative w-full h-40 mb-4">
                      <Image src={preview || "/placeholder.svg"} alt="Logo preview" fill className="object-contain" />
                    </div>
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                  )}

                  <div className="text-center">
                    {preview ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null)
                          setPreview(null)
                        }}
                      >
                        Change Image
                      </Button>
                    ) : (
                      <>
                        <Label htmlFor="file-upload" className="cursor-pointer text-green-600 hover:text-green-500">
                          Upload a file
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, SVG up to 2MB</p>
                      </>
                    )}
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Why this name and logo?</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us why your suggestion represents our mission..."
              className="h-[200px]"
              required
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Suggestion"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
