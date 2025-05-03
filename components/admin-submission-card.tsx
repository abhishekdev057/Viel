"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { approveSubmission, rejectSubmission } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Submission } from "@/lib/types"
import Image from "next/image"

interface AdminSubmissionCardProps {
  submission: Submission
  isApproved?: boolean
}

export default function AdminSubmissionCard({ submission, isApproved = false }: AdminSubmissionCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await approveSubmission(submission.id)
      toast({
        title: "Submission approved",
        description: `${submission.name} has been approved and is now visible to all users.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await rejectSubmission(submission.id)
      toast({
        title: "Submission rejected",
        description: `${submission.name} has been rejected.`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{submission.name}</h3>
          <div className="text-sm text-gray-500">{new Date(submission.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
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
        <p className="text-gray-600 text-sm">{submission.description}</p>
      </CardContent>

      <CardFooter className="border-t pt-4">
        {isApproved ? (
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center text-green-600 gap-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Approved</span>
            </div>
            <div className="text-sm text-gray-500">
              Likes: {submission.likes || 0} | Dislikes: {submission.dislikes || 0}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
              onClick={handleReject}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
              onClick={handleApprove}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
