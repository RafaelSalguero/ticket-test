import { requireAdminPage } from '@/lib/admin-auth'
import { getSalesReport } from '@/actions/admin-actions'
import { AdminDashboardView } from '@/components/admin/admin-dashboard-view'

/**
 * Admin Dashboard Page
 * Shows overview stats and quick links to admin features
 */
export default async function AdminDashboardPage() {
  // Require admin authentication
  await requireAdminPage()

  // Fetch sales report for dashboard stats
  const salesReport = await getSalesReport()

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminDashboardView
        eventCount={salesReport.eventCount}
        totalRevenue={salesReport.totalRevenue}
        totalTicketsSold={salesReport.totalTicketsSold}
      />
    </div>
  )
}
