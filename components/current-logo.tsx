"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { likeCurrentLogo, dislikeCurrentLogo } from "@/lib/actions"

export default function CurrentLogo() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userAction, setUserAction] = useState<"like" | "dislike" | null>(null)

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like the logo",
        variant: "destructive",
      })
      signIn("google")
      return
    }

    if (userAction === "like") return

    try {
      await likeCurrentLogo()
      setLikes((prev) => prev + 1)
      if (userAction === "dislike") {
        setDislikes((prev) => prev - 1)
      }
      setUserAction("like")

      toast({
        title: "Thanks for your feedback!",
        description: "You liked the current logo",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your like",
        variant: "destructive",
      })
    }
  }

  const handleDislike = async () => {
    if (!session) {
      toast({
        title: "Sign in required",
        description: "Please sign in to dislike the logo",
        variant: "destructive",
      })
      signIn("google")
      return
    }

    if (userAction === "dislike") return

    try {
      await dislikeCurrentLogo()
      setDislikes((prev) => prev + 1)
      if (userAction === "like") {
        setLikes((prev) => prev - 1)
      }
      setUserAction("dislike")

      toast({
        title: "Thanks for your feedback!",
        description: "You disliked the current logo",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record your dislike",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm mb-12 animate-fade-in">
      <div className="flex flex-col items-center">
        <img src="/placeholder.svg?height=200&width=200" alt="Current Logo" className="w-40 h-40 object-contain mb-6" />
        <h3 className="text-2xl font-bold mb-2">Current Name: Gram Mitra</h3>
        <p className="text-gray-500 mb-6">What do you think about our current branding?</p>

        <div className="flex gap-4">
          <Button
            variant={userAction === "like" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={handleLike}
          >
            <ThumbsUp className="w-5 h-5" />
            <span>Like</span>
            <span className="bg-white text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              {likes}
            </span>
          </Button>

          <Button
            variant={userAction === "dislike" ? "destructive" : "outline"}
            className="flex items-center gap-2"
            onClick={handleDislike}
          >
            <ThumbsDown className="w-5 h-5" />
            <span>Dislike</span>
            <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              {dislikes}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
