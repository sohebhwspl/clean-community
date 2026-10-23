'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from '@/lib/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import FormField from '@/components/FormField'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/utils/errors'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password)
      const from = searchParams.get('from')
      navigate(from && from.startsWith('/') && !from.startsWith('//') ? from : '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold text-primary">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register('email')} />
            </FormField>
            <FormField label="Password" error={errors.password?.message}>
              <PasswordInput autoComplete="current-password" {...register('password')} />
            </FormField>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in…' : 'Login'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}