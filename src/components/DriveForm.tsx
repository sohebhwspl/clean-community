'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import FormField from '@/components/FormField'
import type { DrivePayload } from '@/services/driveService'
import { getErrorMessage } from '@/utils/errors'

const schema = z.object({
  title: z.string().min(3, 'Enter a title').max(150),
  description: z.string().min(5, 'Enter a short description').max(2000),
  date: z.string().min(1, 'Choose a date'),
  time: z.string().min(1, 'Choose a time'),
  location: z.string().min(3, 'Enter the location').max(200),
})
type FormData = z.infer<typeof schema>

interface Props {
  initial?: Partial<FormData>
  submitLabel: string
  onSubmit: (values: DrivePayload) => Promise<void>
  onCancel: () => void
}

export default function DriveForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: initial })

  const submit = async (data: FormData) => {
    setError('')
    try {
      await onSubmit(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Card className="border-primary/30">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <FormField label="Title" error={errors.title?.message}>
            <Input {...register('title')} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Textarea rows={3} {...register('description')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date" error={errors.date?.message}>
              <Input type="date" {...register('date')} />
            </FormField>
            <FormField label="Start time" error={errors.time?.message}>
              <Input type="time" {...register('time')} />
            </FormField>
          </div>
          <FormField label="Location" error={errors.location?.message}>
            <Input {...register('location')} />
          </FormField>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>{submitLabel}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}