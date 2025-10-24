'use client'

import { useLoginForm } from '@/hooks/use-auth-form'
import { LoginFormView } from '@/components/auth/login-form-view'

/**
 * Login page container component
 * Uses hook for state management and view component for presentation
 */
export default function LoginPage() {
  const { state, isPending, formAction } = useLoginForm()

  return <LoginFormView state={state} isPending={isPending} formAction={formAction} />
}
