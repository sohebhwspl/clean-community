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
import NativeSelect from '@/components/NativeSelect'
import { useAuth } from '@/hooks/useAuth'
import { getErrorMessage } from '@/utils/errors'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your name').max(100),
    email: z.string().email('Enter a valid email'),
    phone: z.string().max(20, 'Phone is too long').optional(),
    role: z.enum(['RESIDENT', 'VOLUNTEER']),
    password: z.string().min(6, 'Use at least 6 characters').max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' })
type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: signUp } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'RESIDENT' } })

  const onSubmit = async ({ confirm: _confirm, ...data }: FormData) => {
    setError('')
    try {
      await signUp(data)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold text-primary">Create an account</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full name" error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register('email')} />
            </FormField>
            <FormField label="Phone (optional)" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            <FormField label="I want to join as" error={errors.role?.message}>
              <NativeSelect {...register('role')}>
                <option value="RESIDENT">Resident (report issues)</option>
                <option value="VOLUNTEER">Volunteer (clean up issues)</option>
              </NativeSelect>
            </FormField>
            <FormField label="Password" error={errors.password?.message}>
              <PasswordInput autoComplete="new-password" {...register('password')} />
            </FormField>
            <FormField label="Confirm password" error={errors.confirm?.message}>
              <PasswordInput autoComplete="new-password" {...register('confirm')} />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Register'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}