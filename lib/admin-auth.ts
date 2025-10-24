import { User } from '@/types';
import { requireAuth } from './auth';
import { redirect } from 'next/navigation';

/**
 * Check if a user has admin role
 * @param user - User object or null
 * @returns true if user has admin role, false otherwise
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Require admin authentication - verifies user is logged in AND has admin role
 * Throws an error if the user is not authenticated or not an admin
 * Use this in server actions that require admin privileges
 * @returns The authenticated admin user
 * @throws Error if not authenticated or not an admin
 */
export async function requireAdmin(): Promise<User> {
  // First check if user is authenticated
  const user = await requireAuth();
  
  // Then check if user has admin role
  if (!isAdmin(user)) {
    throw new Error('Admin access required');
  }
  
  return user;
}

/**
 * Require admin authentication for pages - redirects to login if not authenticated or not admin
 * Use this in page components to protect admin routes
 * @returns The authenticated admin user
 */
export async function requireAdminPage(): Promise<User> {
  try {
    return await requireAdmin();
  } catch (error) {
    // Redirect to login page if not authenticated or not admin
    redirect('/login');
  }
}
