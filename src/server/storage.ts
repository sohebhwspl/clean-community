import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let client: S3Client | undefined

function s3() {
  // S3_* names are used because Vercel does not allow variables that start with AWS_.
  const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY
  client ??= new S3Client({
    region: process.env.S3_REGION ?? process.env.AWS_REGION ?? 'ap-south-1',
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    endpoint: process.env.S3_ENDPOINT || undefined, // only for S3-compatible services (MinIO, R2, ...)
    forcePathStyle: !!process.env.S3_ENDPOINT,
  })
  return client
}

function bucket() {
  const b = process.env.S3_BUCKET
  if (!b) throw new Error('S3_BUCKET is not set')
  return b
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }))
}

export async function deleteObject(key: string) {
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }))
  } catch (err) {
    console.error('Could not delete S3 object', key, err)
  }
}

export const presignedUrl = (key: string) =>
  getSignedUrl(s3(), new GetObjectCommand({ Bucket: bucket(), Key: key }), { expiresIn: 3600 })
