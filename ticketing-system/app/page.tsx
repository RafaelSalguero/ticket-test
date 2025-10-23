import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Sports Venue Ticketing</h1>
          <p className="text-xl text-gray-600 mb-8">
            Book tickets for your favorite sports events
          </p>
          <Link href="/events">
            <Button size="lg">Browse Events</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Easy Booking</CardTitle>
              <CardDescription>
                Select your seats and book tickets in just a few clicks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payment</CardTitle>
              <CardDescription>
                Your payment information is safe and secure with us
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instant Confirmation</CardTitle>
              <CardDescription>
                Receive your tickets immediately after purchase
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ol className="space-y-3 text-gray-700">
            <li>1. Browse available events and select your preferred event</li>
            <li>2. Choose your seats from available sections</li>
            <li>3. Complete your purchase securely</li>
            <li>4. Receive your tickets and enjoy the event!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
