import { redirect } from "next/navigation"
import { getPendingSubmissions, getApprovedSubmissions } from "@/lib/submissions"
import AdminSubmissionCard from "@/components/admin-submission-card"
import { getToken } from "next-auth/jwt"
import { cookies } from "next/headers"

export default async function AdminPage() {
  // This is protected by middleware, but we'll add an extra check
  const cookieStore = cookies()
  const token = await getToken({
    req: { cookies: cookieStore } as any,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token || token.email !== "abhishekdev057@gmail.com") {
    redirect("/")
  }

  const pendingSubmissions = await getPendingSubmissions()
  const approvedSubmissions = await getApprovedSubmissions()

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-amber-600">Pending Approvals ({pendingSubmissions.length})</h2>
        {pendingSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">No pending submissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSubmissions.map((submission) => (
              <AdminSubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-green-600">
          Approved Submissions ({approvedSubmissions.length})
        </h2>
        {approvedSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">No approved submissions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedSubmissions.map((submission) => (
              <AdminSubmissionCard key={submission.id} submission={submission} isApproved />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
