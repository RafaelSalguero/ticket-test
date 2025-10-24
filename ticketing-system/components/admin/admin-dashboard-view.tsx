import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AdminDashboardViewProps {
  eventCount: number
  totalRevenue: number
  totalTicketsSold: number
}

/**
 * Pure view component for admin dashboard
 * Shows quick stats and navigation to admin sections
 */
export function AdminDashboardView({ eventCount, totalRevenue, totalTicketsSold }: AdminDashboardViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <p className="text-gray-600">Manage events and view reports</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrency(totalRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tickets Sold</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {totalTicketsSold}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {eventCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
            <CardDescription>Create and manage events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Create new events, edit existing ones, and manage seating sections.
            </p>
            <div className="flex gap-2">
              <Link href="/admin/events">
                <Button>Manage Events</Button>
              </Link>
              <Link href="/admin/events/create">
                <Button variant="outline">Create New Event</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>View sales and attendance reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Access detailed reports on sales, revenue, and event attendance.
            </p>
            <Link href="/admin/reports">
              <Button>View Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Current system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Active Events</p>
              <p className="text-2xl font-bold">{eventCount}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Total Tickets Sold</p>
              <p className="text-2xl font-bold">{totalTicketsSold}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
