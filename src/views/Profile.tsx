'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import FormField from '@/components/FormField'
import { useAuth } from '@/hooks/useAuth'
import { updateMe } from '@/services/authService'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, titleCase } from '@/utils/format'

const schema = z.object({
  name: z.string().min(2, 'Enter your name').max(100),
  phone: z.string().max(20, 'Phone is too long').optional(),
})
type FormData = z.infer<typeof schema>

export default function Profile() {
  const { user, setUser } = useAuth()
  const [message, setMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name, phone: user?.phone ?? '' },
  })

  if (!user) return null

  const onSubmit = async (data: FormData) => {
    try {
      setUser(await updateMe(data.name, data.phone ?? ''))
      setMessage('Profile updated.')
    } catch (err) {
      setMessage(getErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardContent className="space-y-4 p-6">
          <h1 className="text-2xl font-bold text-primary">My Profile</h1>
          <dl className="space-y-1 text-sm">
            <div><dt className="inline text-muted-foreground">Email: </dt><dd className="inline">{user.email}</dd></div>
            <div><dt className="inline text-muted-foreground">Role: </dt><dd className="inline">{titleCase(user.role)}</dd></div>
            <div><dt className="inline text-muted-foreground">Member since: </dt><dd className="inline">{formatDate(user.createdAt)}</dd></div>
          </dl>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full name" error={errors.name?.message}>
              <Input {...register('name')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input {...register('phone')} />
            </FormField>
            {message && <p className="text-sm text-primary">{message}</p>}
            <Button type="submit" disabled={isSubmitting}>Save changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}