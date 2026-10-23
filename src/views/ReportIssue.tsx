'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from '@/lib/router'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import FormField from '@/components/FormField'
import NativeSelect from '@/components/NativeSelect'
import ImagePicker from '@/components/ImagePicker'
import LinkButton from '@/components/LinkButton'
import { createIssue, uploadImages } from '@/services/issueService'
import { getErrorMessage } from '@/utils/errors'
import { issueCode, titleCase } from '@/utils/format'
import { CATEGORIES, PRIORITIES } from '@/utils/constants'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  category: z.enum(CATEGORIES as [string, ...string[]], { message: 'Choose a category' }),
  description: z.string().min(10, 'Please describe the problem (at least 10 characters)').max(2000),
  location: z.string().min(3, 'Enter the location').max(200),
  landmark: z.string().max(200).optional(),
  priority: z.enum(PRIORITIES as [string, ...string[]]),
})
type FormData = z.infer<typeof schema>

export default function ReportIssue() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ id: number; photoError: boolean } | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { priority: 'MEDIUM' } })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const issue = await createIssue(data as Parameters<typeof createIssue>[0])
      let photoError = false
      if (files.length > 0) {
        try {
          await uploadImages(issue.id, files, 'BEFORE')
        } catch {
          photoError = true
        }
      }
      setDone({ id: issue.id, photoError })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Report submitted!</h1>
        <p className="mt-2 text-muted-foreground">
          Your issue ID is <span className="font-semibold text-foreground">{issueCode(done.id)}</span>. Use it to track progress.
        </p>
        {done.photoError && (
          <p className="mt-2 text-sm text-destructive">Your report was saved, but the photos could not be uploaded.</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton to={`/issues/${done.id}`}>View Issue</LinkButton>
          <LinkButton to="/my-reports" variant="outline">My Reports</LinkButton>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-primary">Report an Issue</h1>
          <p className="mb-5 text-sm text-muted-foreground">Tell us what needs cleaning and where it is.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Title" error={errors.title?.message}>
              <Input placeholder="e.g. Garbage pile near bus stop" {...register('title')} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category" error={errors.category?.message}>
                <NativeSelect defaultValue="" {...register('category')}>
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
                </NativeSelect>
              </FormField>
              <FormField label="Priority" error={errors.priority?.message}>
                <NativeSelect {...register('priority')}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
                </NativeSelect>
              </FormField>
            </div>
            <FormField label="Description" error={errors.description?.message}>
              <Textarea rows={4} {...register('description')} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Location" error={errors.location?.message}>
                <Input placeholder="Street, area, city" {...register('location')} />
              </FormField>
              <FormField label="Landmark (optional)" error={errors.landmark?.message}>
                <Input placeholder="Near…" {...register('landmark')} />
              </FormField>
            </div>
            <FormField label="Before-cleanup photos">
              <ImagePicker files={files} onChange={setFiles} />
            </FormField>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit Report'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')}>Cancel</Button>
            </div>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Not sure what to write? <Link to="/issues" className="text-primary hover:underline">Browse existing reports</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}