import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SalesReport, AttendanceReport, RevenueData } from '@/types'

interface ReportsViewProps {
  salesReport: SalesReport
  attendanceReport: AttendanceReport[]
  revenueData: RevenueData[]
}

/**
 * Pure view component for displaying admin reports
 * Shows sales overview, event attendance, and revenue breakdown
 */
export function ReportsView({ salesReport, attendanceReport, revenueData }: ReportsViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculatePercentage = (sold: number, total: number) => {
    if (total === 0) return 0
    return Math.round((sold / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-gray-600">View sales, attendance, and revenue reports</p>
      </div>

      {/* Sales Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Overall system performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(salesReport.totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Tickets Sold</p>
              <p className="text-3xl font-bold text-blue-600">
                {salesReport.totalTicketsSold}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Events</p>
              <p className="text-3xl font-bold text-purple-600">
                {salesReport.eventCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Last 10 completed orders</CardDescription>
        </CardHeader>
        <CardContent>
          {salesReport.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {salesReport.recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {order.user?.first_name} {order.user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{order.user?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.items.length} ticket{order.items.length !== 1 ? 's' : ''} - {' '}
                    {order.items[0]?.ticket.event.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Event Attendance</CardTitle>
          <CardDescription>Seat occupancy by event</CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceReport.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events yet</p>
          ) : (
            <div className="space-y-4">
              {attendanceReport.map((event) => (
                <div key={event.eventId} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{event.eventName}</p>
                      <p className="text-sm text-gray-500">
                        {event.soldSeats} / {event.totalSeats} seats sold (
                        {calculatePercentage(event.soldSeats, event.totalSeats)}%)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatCurrency(event.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${calculatePercentage(event.soldSeats, event.totalSeats)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Event */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Event</CardTitle>
          <CardDescription>Revenue breakdown for all events</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No revenue data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Event</th>
                    <th className="text-right py-2 px-4 font-medium">Tickets Sold</th>
                    <th className="text-right py-2 px-4 font-medium">Revenue</th>
                    <th className="text-right py-2 px-4 font-medium">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((event) => (
                    <tr key={event.eventId} className="border-b last:border-b-0">
                      <td className="py-3 px-4">{event.eventName}</td>
                      <td className="text-right py-3 px-4">{event.ticketsSold}</td>
                      <td className="text-right py-3 px-4 font-medium text-green-600">
                        {formatCurrency(event.revenue)}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600">
                        {event.ticketsSold > 0
                          ? formatCurrency(event.revenue / event.ticketsSold)
                          : formatCurrency(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-3 px-4">Total</td>
                    <td className="text-right py-3 px-4">
                      {revenueData.reduce((sum, e) => sum + e.ticketsSold, 0)}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600">
                      {formatCurrency(revenueData.reduce((sum, e) => sum + e.revenue, 0))}
                    </td>
                    <td className="text-right py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
