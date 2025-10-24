import { requireAdminPage } from '@/lib/admin-auth'
import { getSalesReport, getEventAttendanceReport, getRevenueByEvent } from '@/actions/admin-actions'
import { ReportsView } from '@/components/admin/reports-view'

/**
 * Admin Reports Page
 * Displays sales, attendance, and revenue reports
 */
export default async function AdminReportsPage() {
  // Require admin authentication
  await requireAdminPage()

  // Fetch all report data
  const [salesReport, attendanceReport, revenueData] = await Promise.all([
    getSalesReport(),
    getEventAttendanceReport(),
    getRevenueByEvent(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportsView
        salesReport={salesReport}
        attendanceReport={attendanceReport}
        revenueData={revenueData}
      />
    </div>
  )
}
