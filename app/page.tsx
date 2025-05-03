import { Suspense } from "react"
import SubmissionForm from "@/components/submission-form"
import CurrentLogo from "@/components/current-logo"
import SubmissionsList from "@/components/submissions-list"
import { getSubmissions } from "@/lib/submissions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SessionProvider } from "@/components/session-provider"
import { UserCheck } from "@/components/user-check"

export default async function Home() {
  const submissions = await getSubmissions()

  return (
    <SessionProvider>
      <main className="min-h-screen">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-700 to-green-500 text-white py-12 rounded-b-3xl shadow-md mb-8">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Gram Mitra</h1>
              <p className="text-xl mb-8">Empowering Rural India with Smart Solutions</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <a href="#submit-section">Submit Your Idea</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/20">
                  <a href="#community-section">View Submissions</a>
                </Button>
                <UserCheck
                  email="abhishekdev057@gmail.com"
                  fallback={null}
                  children={
                    <Button asChild size="lg" variant="destructive">
                      <Link href="/admin">Admin Dashboard</Link>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Current Logo Section */}
          <CurrentLogo />

          {/* Submit Section */}
          <div id="submit-section" className="py-10">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-16 after:h-1 after:bg-green-500">
              Submit Your Suggestion
            </h2>

            <Suspense fallback={<div>Loading...</div>}>
              <SubmissionForm />
            </Suspense>
          </div>

          {/* Community Submissions Section */}
          <div id="community-section" className="py-10">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-8 relative after:content-[''] after:absolute after:bottom-[-10px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-16 after:h-1 after:bg-green-500">
              Community Submissions
            </h2>
            <SubmissionsList submissions={submissions} />
          </div>
        </div>
      </main>
    </SessionProvider>
  )
}
