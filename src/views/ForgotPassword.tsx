'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@/lib/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import { forgotPassword, resetPassword } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'

const emailSchema = z.object({ email: z.string().email('Enter a valid email') })
type EmailForm = z.infer<typeof emailSchema>

const resetSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
    newPassword: z.string().min(6, 'At least 6 characters').max(72, 'At most 72 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type ResetForm = z.infer<typeof resetSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  const sendCode = async (address: string) => {
    setError('')
    try {
      await forgotPassword(address)
      setEmail(address)
      setStep('reset')
      setInfo(`If an account exists for ${address}, a 6-digit code has been sent. It expires in 10 minutes.`)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const onReset = async (data: ResetForm) => {
    setError('')
    try {
      await resetPassword(email, data.otp, data.newPassword)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold text-primary">Forgot password</h1>

          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit((d) => sendCode(d.email))} className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter your account email and we will send you a verification code.</p>
              <FormField label="Email" error={emailForm.formState.errors.email?.message}>
                <Input type="email" autoComplete="email" {...emailForm.register('email')} />
              </FormField>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? 'Sending…' : 'Send code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
              <p className="text-sm text-muted-foreground">{info}</p>
              <FormField label="Verification code" error={resetForm.formState.errors.otp?.message}>
                <Input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  {...resetForm.register('otp')}
                />
              </FormField>
              <FormField label="New password" error={resetForm.formState.errors.newPassword?.message}>
                <PasswordInput autoComplete="new-password" {...resetForm.register('newPassword')} />
              </FormField>
              <FormField label="Confirm new password" error={resetForm.formState.errors.confirm?.message}>
                <PasswordInput autoComplete="new-password" {...resetForm.register('confirm')} />
              </FormField>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting}>
                {resetForm.formState.isSubmitting ? 'Updating…' : 'Change password'}
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" className="text-primary hover:underline" onClick={() => sendCode(email)}>
                  Resend code
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:underline"
                  onClick={() => {
                    setStep('email')
                    setError('')
                  }}
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Remembered it? <Link to="/login" className="font-medium text-primary hover:underline">Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
