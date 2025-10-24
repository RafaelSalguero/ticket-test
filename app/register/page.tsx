'use client'

import { useRegisterForm } from '@/hooks/use-auth-form'
import { RegisterFormView } from '@/components/auth/register-form-view'

/**
 * Register page container component
 * Uses hook for state management and view component for presentation
 */
export default function RegisterPage() {
  const { state, isPending, formAction } = useRegisterForm()

  return <RegisterFormView state={state} isPending={isPending} formAction={formAction} />
}
