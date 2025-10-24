import Link from 'next/link'
import { getUser, logout } from '@/actions/auth-actions'
import { isAdmin } from '@/lib/admin-auth'
import { Button } from '@/components/ui/button'

export async function Navbar() {
  const user = await getUser()
  const userIsAdmin = isAdmin(user)

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Ticket System
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Events
          </Link>

          {user ? (
            <>
              <Link href="/orders" className="text-gray-600 hover:text-gray-900">
                My Orders
              </Link>
              {userIsAdmin && (
                <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                  Admin
                </Link>
              )}
              <span className="text-sm text-gray-600">
                {user.first_name} {user.last_name}
              </span>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
