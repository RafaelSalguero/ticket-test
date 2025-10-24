'use server'

import { redirect } from 'next/navigation'
import { query } from '@/lib/db'
import { hashPassword, verifyPassword, setSession, clearSession, getCurrentUser } from '@/lib/auth'
import type { ApiResponse, User } from '@/types'

interface DbUser extends User {
  password_hash: string;
}

export async function login(
  prevState: ApiResponse<{ userId: string }> | null,
  formData: FormData
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
      }
    }

    // Find user by email
    const result = await query<DbUser>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Verify password - support both plain text (for demo) and bcrypt hashed passwords
    let isValid = false
    
    // First try bcrypt verification
    try {
      isValid = await verifyPassword(password, user.password_hash)
    } catch (error) {
      // If bcrypt fails, try plain text comparison (for seed data)
      isValid = password === user.password_hash
    }
    
    // If bcrypt returned false, also try plain text (for seed data)
    if (!isValid) {
      isValid = password === user.password_hash
    }

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      }
    }

    // Set session
    await setSession(user.id)

    return {
      success: true,
      data: { userId: user.id },
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An error occurred during login',
    }
  }
}

export async function register(
  prevState: ApiResponse<{ userId: string }> | null,
  formData: FormData
): Promise<ApiResponse<{ userId: string }>> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // Validation
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return {
        success: false,
        error: 'All fields are required',
      }
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long',
      }
    }

    // Check if user already exists
    const existingUser = await query<User>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return {
        success: false,
        error: 'Email already registered',
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const result = await query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [email, passwordHash, firstName, lastName]
    )

    const newUser = result.rows[0]

    // Set session
    await setSession(newUser.id)

    return {
      success: true,
      data: { userId: newUser.id },
    }
  } catch (error) {
    console.error('Registration error:', error)
    return {
      success: false,
      error: 'An error occurred during registration',
    }
  }
}

export async function logout(): Promise<void> {
  await clearSession()
  redirect('/login')
}

export async function getUser(): Promise<User | null> {
  return await getCurrentUser()
}
