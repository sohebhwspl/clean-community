import { NextResponse } from 'next/server'
import { pathId, route } from '@/server/http'
import { imageUrl } from '@/server/images'

// Photos are public on the site, but the bucket is private: send the browser to a short-lived signed link.
export const GET = route({}, async ({ req, params }) => {
  const url = await imageUrl(pathId(params))
  return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'private, max-age=1800' } })
})
