"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession, signIn, signOut } from "next-auth/react"
import { UserCircle, LogOut, LogIn } from "lucide-react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-green-700">
          Gram Mitra
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {session.user?.image ? (
                  <img
                    src={session.user.image || "/placeholder.svg"}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircle className="w-8 h-8 text-gray-500" />
                )}
                <span className="hidden md:inline text-sm font-medium">{session.user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={() => signIn("google")} className="flex items-center gap-1">
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
