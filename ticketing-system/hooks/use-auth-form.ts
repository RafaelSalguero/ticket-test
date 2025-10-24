'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/actions/auth-actions'
import type { UseAuthFormReturn } from '@/types'

/**
 * Hook for managing login form state and actions
 * Handles form submission, redirects on success
 */
export function useLoginForm(): UseAuthFormReturn {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(login, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/')
    }
  }, [state?.success, router])

  return {
    state,
    isPending,
    formAction,
  }
}

/**
 * Hook for managing register form state and actions
 * Handles form submission, redirects on success
 */
export function useRegisterForm(): UseAuthFormReturn {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(register, null)

  useEffect(() => {
    if (state?.success) {
      router.push('/')
    }
  }, [state?.success, router])

  return {
    state,
    isPending,
    formAction,
  }
}
