import { NextResponse, type NextRequest } from 'next/server'
import { ZodError, type ZodType } from 'zod'
import { getAuthUser, type AuthUser } from './auth'
import { connectDb } from './db'
import type { Role } from './models'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
  static badRequest = (m: string) => new ApiError(400, m)
  static forbidden = (m: string) => new ApiError(403, m)
  static notFound = (what: string) => new ApiError(404, `${what} not found`)
  static conflict = (m: string) => new ApiError(409, m)
}

type Ctx = { params: Promise<Record<string, string>> }

interface HandlerArgs {
  req: NextRequest
  params: Record<string, string>
  /** null for anonymous callers on public routes */
  user: AuthUser | null
}

interface Options {
  /** 'any' = must be logged in; a role list = must hold one of the roles; omitted = public. */
  auth?: 'any' | Role[]
}

/** Wraps a route handler: connects the DB, authenticates, checks the role and maps errors to { message }. */
export function route(opts: Options, fn: (a: HandlerArgs) => Promise<Response | object | void>) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      await connectDb()
      const user = await getAuthUser(req)
      if (opts.auth) {
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        if (opts.auth !== 'any' && !opts.auth.includes(user.role)) {
          return NextResponse.json({ message: 'You do not have permission' }, { status: 403 })
        }
      }
      const result = await fn({ req, params: await ctx.params, user })
      if (result instanceof Response) return result
      if (result === undefined) return new NextResponse(null, { status: 204 })
      return NextResponse.json(result)
    } catch (err) {
      if (err instanceof ApiError) return NextResponse.json({ message: err.message }, { status: err.status })
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {}
        for (const issue of err.issues) errors[issue.path.join('.') || '_'] ??= issue.message
        return NextResponse.json({ message: 'Validation failed', errors }, { status: 400 })
      }
      console.error(err)
      return NextResponse.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
    }
  }
}

export function created(body: object) {
  return NextResponse.json(body, { status: 201 })
}

export async function readJson<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw ApiError.badRequest('Malformed request body')
  }
  return schema.parse(body)
}

export function pathId(params: Record<string, string>, key = 'id'): number {
  const n = Number(params[key])
  if (!Number.isInteger(n) || n < 1) throw ApiError.notFound('Resource')
  return n
}

export function intParam(url: URL, key: string, def: number): number {
  const v = url.searchParams.get(key)
  if (v === null || v === '') return def
  const n = Number(v)
  if (!Number.isInteger(n)) throw ApiError.badRequest(`Invalid ${key}`)
  return n
}

export function enumValue<T extends string>(v: unknown, key: string, values: readonly T[]): T | undefined {
  if (v === null || v === undefined || v === '') return undefined
  if (typeof v !== 'string' || !(values as readonly string[]).includes(v)) throw ApiError.badRequest(`Invalid ${key}`)
  return v as T
}

export const enumParam = <T extends string>(url: URL, key: string, values: readonly T[]) =>
  enumValue(url.searchParams.get(key), key, values)
