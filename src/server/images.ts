import { randomUUID } from 'node:crypto'
import type { AuthUser } from './auth'
import { ApiError } from './http'
import { nextId } from './ids'
import { findIssue } from './issues'
import { IssueImage, WorkAssignment, User, type ImageType } from './models'
import { deleteObject, presignedUrl, putObject } from './storage'

const MAX_FILES_PER_REQUEST = 5
const MAX_BYTES = 5 * 1024 * 1024
/** Folder inside the bucket that holds all photos, e.g. cleancommunity/issues/12/<uuid>.jpg */
const S3_PREFIX = (process.env.S3_PREFIX ?? 'cleancommunity').replace(/^\/+|\/+$/g, '')
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

/** The real type comes from the file's magic bytes, not from what the browser claims. */
function detectContentType(b: Uint8Array): string | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png'
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'image/webp'
  }
  return null
}

async function checkCanUpload(issueId: number, reporterId: number, type: ImageType, user: AuthUser) {
  if (user.role === 'ADMIN') return
  const allowed =
    type === 'BEFORE'
      ? reporterId === user.id
      : !!(await WorkAssignment.exists({ issueId, volunteerId: user.id }))
  if (!allowed) throw ApiError.forbidden('You cannot upload this kind of image to this issue')
}

export async function uploadImages(issueId: number, type: ImageType, files: File[], user: AuthUser) {
  const issue = await findIssue(issueId)
  await checkCanUpload(issueId, issue.reporterId, type, user)
  if (files.length === 0) throw ApiError.badRequest('Choose at least one image')
  if (files.length > MAX_FILES_PER_REQUEST) throw ApiError.badRequest('You can upload up to 5 images at a time')

  // Validate everything first so a bad file never leaves a half-saved batch behind.
  const checked: { file: File; bytes: Buffer; contentType: string }[] = []
  for (const file of files) {
    if (file.size === 0) throw ApiError.badRequest('Empty file')
    if (file.size > MAX_BYTES) throw ApiError.badRequest('Each image must be 5 MB or smaller')
    const bytes = Buffer.from(await file.arrayBuffer())
    const contentType = detectContentType(bytes.subarray(0, 12))
    if (!contentType || !file.type.startsWith('image/')) {
      throw ApiError.badRequest('Only JPEG, PNG and WebP images are allowed')
    }
    checked.push({ file, bytes, contentType })
  }

  // Upload to S3 first; if any upload fails, remove the ones already stored.
  const stored: { file: File; key: string; contentType: string }[] = []
  try {
    for (const { file, bytes, contentType } of checked) {
      const key = `${S3_PREFIX}/issues/${issueId}/${randomUUID()}.${EXTENSIONS[contentType]}`
      await putObject(key, bytes, contentType)
      stored.push({ file, key, contentType })
    }
  } catch (err) {
    await Promise.all(stored.map((s) => deleteObject(s.key)))
    throw err
  }

  const uploader = await User.findById(user.id).select('name').lean()
  const saved = []
  for (const { file, key, contentType } of stored) {
    const img = await IssueImage.create({
      _id: await nextId('issue_images'),
      issueId,
      uploadedBy: user.id,
      imageType: type,
      originalName: file.name || null,
      contentType,
      key,
    })
    saved.push({ id: img._id, type, createdAt: img.createdAt, uploadedBy: uploader?.name ?? '' })
  }
  return saved
}

/** Short-lived signed S3 link; the bucket itself stays private. */
export async function imageUrl(imageId: number) {
  const img = await IssueImage.findById(imageId).select('key').lean()
  if (!img) throw ApiError.notFound('Image')
  return presignedUrl(img.key)
}

export async function deleteImage(issueId: number, imageId: number, user: AuthUser) {
  const img = await IssueImage.findById(imageId).lean()
  if (!img || img.issueId !== issueId) throw ApiError.notFound('Image')
  if (user.role !== 'ADMIN' && img.uploadedBy !== user.id) {
    throw ApiError.forbidden('You can only delete images you uploaded')
  }
  await IssueImage.deleteOne({ _id: imageId })
  await deleteObject(img.key)
}

/** Reads the `files` entries of a multipart body, ignoring empty file inputs. */
export function filesFrom(form: FormData): File[] {
  return form.getAll('files').filter((f): f is File => typeof f !== 'string' && f.size > 0)
}
