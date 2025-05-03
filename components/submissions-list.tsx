"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react"
import { likeSubmission, dislikeSubmission } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import type { Submission } from "@/lib/types"
import Image from "next/image"

interface SubmissionsListProps {
  submissions: Submission[]
}

export default function SubmissionsList({ submissions }: SubmissionsListProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [userActions, setUserActions] = useState<Record<string, "like" | "dislike" | null>>({})
  const [submissionLikes, setSubmissionLikes] = useState<Record<string, number>>(
    Object.fromEntries(submissions.map((s) => [s.id, s.likes || 0])),
  )
  const [submissionDislikes, setSubmissionDislikes] = useState<Record<string, number>>(
    Object.fromEntries(submissions.map((s) => [s.id, s.dislikes || 0])),
  )

  const handleLike = async (submissionId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like submissions",
        variant: "destructive",
      })
      signIn("google")
      return
    }

    if (userActions[submissionId] === "like") return

    try {
      await likeSubmission(submissionId)

      setSubmissionLikes((prev) => ({
        ...prev,
        [submissionId]: (prev[submissionId] || 0) + 1,
      }))

      if (userActions[submissionId] === "dislike") {
        setSubmissionDislikes((prev) => ({
          ...prev,
          [submissionId]: Math.max(0, (prev[submissionId] || 0) - 1),
        }))
      }

      setUserActions((prev) => ({
        ...prev,
        [submissionId]: "like",
      }))

      toast({
        title: "Thanks for your feedback!",
        description: "You liked this submission",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your like",
        variant: "destructive",
      })
    }
  }

  const handleDislike = async (submissionId: string) => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to dislike submissions",
        variant: "destructive",
      })
      signIn("google")
      return
    }

    if (userActions[submissionId] === "dislike") return

    try {
      await dislikeSubmission(submissionId)

      setSubmissionDislikes((prev) => ({
        ...prev,
        [submissionId]: (prev[submissionId] || 0) + 1,
      }))

      if (userActions[submissionId] === "like") {
        setSubmissionLikes((prev) => ({
          ...prev,
          [submissionId]: Math.max(0, (prev[submissionId] || 0) - 1),
        }))
      }

      setUserActions((prev) => ({
        ...prev,
        [submissionId]: "dislike",
      }))

      toast({
        title: "Thanks for your feedback!",
        description: "You disliked this submission",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your dislike",
        variant: "destructive",
      })
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-green-50 rounded-xl p-8 shadow-sm text-center">
        <div className="flex flex-col items-center">
          <MessageSquare className="w-12 h-12 text-green-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
          <p className="text-gray-600">Be the first to submit your branding idea!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((submission) => (
        <Card key={submission.id} className="overflow-hidden h-full flex flex-col">
          <CardHeader className="pb-0">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{submission.name}</h3>
              {submission.status === "pending" ? (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  Pending Approval
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Approved
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                {submission.userImage ? (
                  <img
                    src={submission.userImage || "/placeholder.svg"}
                    alt={submission.userName}
                    className="w-5 h-5 rounded-full mr-1"
                  />
                ) : null}
                <span>{submission.userName}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="py-4 flex-grow">
            <div className="relative w-full h-40 mb-4 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={submission.logoUrl || "/placeholder.svg?height=160&width=320"}
                alt={`${submission.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm line-clamp-3">{submission.description}</p>
          </CardContent>

          <CardFooter className="border-t pt-4">
            <div className="flex justify-between w-full">
              <div className="flex gap-2">
                <Button
                  variant={userActions[submission.id] === "like" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleLike(submission.id)}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{submissionLikes[submission.id] || 0}</span>
                </Button>

                <Button
                  variant={userActions[submission.id] === "dislike" ? "destructive" : "outline"}
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDislike(submission.id)}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>{submissionDislikes[submission.id] || 0}</span>
                </Button>
              </div>

              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>Comment</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
