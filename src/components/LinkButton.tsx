'use client'

import { Link, type LinkProps } from '@/lib/router'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = LinkProps & VariantProps<typeof buttonVariants>

export default function LinkButton({ variant, size, className, ...props }: Props) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />
}