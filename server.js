require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const crypto = require('crypto')
const { Readable } = require('stream')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { createClient } = require('@sanity/client')
const imageUrlBuilder = require('@sanity/image-url')

const app = express()
const port = process.env.PORT || 3001

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '0c912k6j'
const SANITY_DATASET = process.env.SANITY_DATASET || 'production'
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01'
const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'change-me-in-production'
const MAGIC_LINK_TTL = process.env.MAGIC_LINK_TTL || '15m'
const SESSION_TOKEN_TTL = process.env.SESSION_TOKEN_TTL || '2h'
// Default to SMTP_USER if available, otherwise use a placeholder
// Most SMTP providers require the 'from' address to match the authenticated user
// IMPORTANT: For custom email servers, the 'from' address MUST match SMTP_USER exactly
const MAGIC_LINK_FROM_EMAIL =
  process.env.MAGIC_LINK_FROM_EMAIL || process.env.SMTP_USER || 'no-reply@superstudio.example'
const STUDENT_SUBMISSION_BASE_URL =
  process.env.STUDENT_SUBMISSION_BASE_URL || 'http://localhost:5173/submit'
const IMAGE_UPLOAD_MAX_BYTES = Number(process.env.SUBMISSION_IMAGE_MAX_BYTES || 10 * 1024 * 1024) // 10MB

// SMTP configuration - set DISABLE_SMTP=true in .env to skip email entirely in development
const disableSmtp = process.env.DISABLE_SMTP === 'true'
const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpSecure = process.env.SMTP_SECURE === 'true'
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

// Determine the effective 'from' email address
// Prefer explicitly set MAGIC_LINK_FROM_EMAIL, but fall back to SMTP_USER for better compatibility
// Many SMTP servers require the 'from' address to exactly match the authenticated user
const getFromEmail = () => {
  if (process.env.MAGIC_LINK_FROM_EMAIL) {
    return process.env.MAGIC_LINK_FROM_EMAIL
  }
  // If SMTP_USER is set, use it (most reliable for custom SMTP servers)
  if (smtpUser) {
    return smtpUser
  }
  // Fall back to the default
  return MAGIC_LINK_FROM_EMAIL
}

const transporter =
  !disableSmtp && smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        // Add connection timeout to fail faster
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
      })
    : null

if (disableSmtp) {
  console.log('[Magic link] SMTP disabled via DISABLE_SMTP=true. Magic links will be logged to console.')
} else if (!smtpHost || !smtpUser || !smtpPass) {
  console.log(
    '[Magic link] SMTP not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or DISABLE_SMTP=true. Magic links will be logged to console.',
  )
} else {
  // Log SMTP configuration for debugging
  const effectiveFrom = getFromEmail()
  if (process.env.MAGIC_LINK_FROM_EMAIL && process.env.MAGIC_LINK_FROM_EMAIL !== smtpUser) {
    console.warn(
      `[Magic link] WARNING: MAGIC_LINK_FROM_EMAIL (${process.env.MAGIC_LINK_FROM_EMAIL}) does not match SMTP_USER (${smtpUser}). ` +
        'Many SMTP servers require these to match. If emails fail, remove MAGIC_LINK_FROM_EMAIL to use SMTP_USER automatically.',
    )
  }
  console.log(
    `[Magic link] SMTP configured: ${smtpHost}:${smtpPort}, user: ${smtpUser}, from: ${effectiveFrom}`,
  )
}

if (!SANITY_WRITE_TOKEN) {
  console.warn(
    '[Student submissions] SANITY_WRITE_TOKEN is not set. Submission mutations and uploads will fail until this token is configured.',
  )
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: IMAGE_UPLOAD_MAX_BYTES,
  },
})

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Log all API requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${req.method}] ${req.path}`)
    }
    next()
  })
}

// Serve Sanity Studio static files from dist directory
const studioPath = path.join(__dirname, 'dist')
const fs = require('fs')

// Check if Studio is built
const studioExists = fs.existsSync(studioPath)
console.log(`Sanity Studio path: ${studioPath}`)
console.log(`Studio exists: ${studioExists}`)

if (studioExists) {
  // Set proper MIME types for JavaScript modules
  const setMimeType = (res, filepath) => {
    if (filepath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript')
      res.setHeader('X-Content-Type-Options', 'nosniff')
    } else if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript')
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css')
    } else if (filepath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json')
    }
  }

  // IMPORTANT: Serve vendor and static files BEFORE any /studio routes
  // These must be handled first to prevent the /studio/* catch-all from intercepting them
  
  // Serve vendor files - express.static will handle all sub-paths
  app.use('/vendor', express.static(path.join(studioPath, 'vendor'), {
    setHeaders: setMimeType,
    index: false
  }))
  
  // Serve static files
  app.use('/static', express.static(path.join(studioPath, 'static'), {
    setHeaders: setMimeType,
    index: false
  }))
  
  // Now handle /studio routes - MUST be after static file routes
  app.get('/studio', (req, res) => {
    res.sendFile(path.join(studioPath, 'index.html'))
  })
  
  // Catch-all for /studio/* routes - serves the SPA
  // But exclude paths that should be handled by static middleware
  app.get('/studio/*', (req, res, next) => {
    // Safety check: if this is a static asset request, let it pass through
    if (req.path.includes('/vendor/') || req.path.includes('/static/')) {
      return next()
    }
    res.sendFile(path.join(studioPath, 'index.html'))
  })
} else {
  // Fallback if Studio not built yet
  app.get('/studio', (req, res) => {
    res.status(503).json({ 
      message: 'Sanity Studio is not built. Run "npm run build:studio" to build it.',
      instructions: 'The Studio will be available at /studio after building.',
      path: studioPath
    })
  })
  
  app.get('/studio/*', (req, res) => {
    res.status(503).json({ 
      message: 'Sanity Studio is not built. Run "npm run build:studio" to build it.',
      instructions: 'The Studio will be available at /studio after building.',
      path: studioPath
    })
  })
}

// Sanity client
const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  useCdn: true,
  apiVersion: SANITY_API_VERSION,
})

const writeClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  useCdn: false,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_WRITE_TOKEN,
})

// Image URL builder
const builder = imageUrlBuilder(client)

const ensureSubmissionDocument = async (email) => {
  if (!SANITY_WRITE_TOKEN) {
    throw new Error('Cannot create submission without SANITY_WRITE_TOKEN configured')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const submissionId = buildSubmissionId(normalizedEmail)

  await writeClient
    .createIfNotExists({
      _id: submissionId,
      _type: 'studentSubmission',
      submittedBy: normalizedEmail,
    })
    .catch((err) => {
      console.error('Error ensuring student submission exists', err)
      throw err
    })

  return submissionId
}

const buildSubmissionId = (email) =>
  `studentSubmission.${crypto.createHash('sha1').update(email).digest('hex')}`

const signMagicLinkToken = (payload, options = {}) =>
  jwt.sign(
    {
      ...payload,
      type: 'magic',
    },
    MAGIC_LINK_SECRET,
    {
      expiresIn: MAGIC_LINK_TTL,
      ...options,
    },
  )

const signSessionToken = (payload, options = {}) =>
  jwt.sign(
    {
      ...payload,
      type: 'session',
    },
    MAGIC_LINK_SECRET,
    {
      expiresIn: SESSION_TOKEN_TTL,
      ...options,
    },
  )

const verifyToken = (token, expectedType) => {
  const decoded = jwt.verify(token, MAGIC_LINK_SECRET)
  if (decoded.type !== expectedType) {
    throw new Error(`Unexpected token type: ${decoded.type}`)
  }
  return decoded
}

const sendMagicLinkEmail = async (email, link) => {
  if (transporter) {
    const fromEmail = getFromEmail()
    try {
      console.log(`[Magic link] Attempting to send email from ${fromEmail} to ${email} via ${smtpHost}:${smtpPort}`)
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject: 'Access your student submission',
        text: `Click the link below to resume your submission:\n\n${link}\n\nThe link expires in ${MAGIC_LINK_TTL}.`,
        html: `<p>Click the button below to resume your submission.</p><p><a href="${link}" style="display:inline-block;padding:12px 16px;background:#111;color:#fff;text-decoration:none;border-radius:4px;">Open submission</a></p><p>If the button does not work, copy and paste this URL into your browser:</p><p><code>${link}</code></p><p>This link expires in ${MAGIC_LINK_TTL}.</p>`,
      })
      console.log(`[Magic link] Email sent successfully to ${email}`)
    } catch (error) {
      console.error(`[Magic link] Failed to send email to ${email}:`, error.message)
      
      // Provide specific help for common errors
      if (error.message.includes('Sender address rejected') || error.message.includes('not owned')) {
        console.error(
          `[Magic link] SMTP Error: The 'from' address (${fromEmail}) is being rejected by your SMTP server.\n` +
            `  - Your SMTP_USER is: ${smtpUser}\n` +
            `  - From address being used: ${fromEmail}\n` +
            `  - SMTP Host: ${smtpHost}:${smtpPort}\n` +
            `\n` +
            `  Possible solutions:\n` +
            `  1. Verify that ${smtpUser} is the correct authenticated user for your SMTP server\n` +
            `  2. Some SMTP servers require the username to be just the part before @ (e.g., "superstudio_admin" instead of "superstudio_admin@aaha.ca")\n` +
            `  3. Check if your email server has restrictions on sending from this address\n` +
            `  4. For development, set DISABLE_SMTP=true to skip email sending\n`,
        )
      }
      
      console.warn(
        `[Magic link] Falling back to console log. Magic link for ${email}: ${link}\n` +
          'Check your SMTP configuration (SMTP_HOST/SMTP_PORT/SMTP_SECURE/SMTP_USER/SMTP_PASS).',
      )
    }
  } else {
    console.warn(
      `[Magic link] SMTP not configured. Magic link for ${email}: ${link}\n` +
        'Configure SMTP_HOST/SMTP_USER/SMTP_PASS to send emails automatically.',
    )
  }
}

const authenticateSession = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' })
  }

  try {
    const decoded = verifyToken(token, 'session')
    req.submissionAuth = decoded
    return next()
  } catch (error) {
    console.error('Failed to verify session token', error)
    return res.status(401).json({ message: 'Invalid or expired session token' })
  }
}

const normalizePosterImage = (posterImage) => {
  if (!posterImage || !posterImage.asset || !posterImage.asset._ref) {
    return undefined
  }

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: posterImage.asset._ref,
    },
    ...(posterImage.alt ? { alt: posterImage.alt } : {}),
  }
}

const normalizeMedia = (media) => {
  if (!Array.isArray(media)) {
    return undefined
  }

  return media
    .map((item) => {
      if (!item) {
        return null
      }

      // Handle image media
      if (item._type === 'image' && item.asset && item.asset._ref) {
        return {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: item.asset._ref,
          },
          ...(item.alt ? { alt: item.alt } : {}),
          ...(item.caption ? { caption: item.caption } : {}),
        }
      }

      // Handle video media
      if (item._type === 'video' && item.video_url) {
        return {
          _type: 'video',
          video_url: item.video_url,
          ...(item.caption ? { caption: item.caption } : {}),
        }
      }

      return null
    })
    .filter(Boolean)
}

const normalizeDescription = (description) => {
  // Description is block content (array of blocks)
  // Validate it's an array and contains valid block structure
  if (!Array.isArray(description)) {
    return undefined
  }

  // Basic validation - ensure it's an array (could add more validation)
  return description
}

// API Routes - must be defined BEFORE frontend catch-all
// Filters endpoint
app.get('/api/filters', async (req, res) => {
  try {
    // Fetch all tags from projects
    const projects = await client.fetch(`
      *[_type == "project"] {
        allTags
      }
    `)

    // Fetch all institutions (schools)
    const institutions = await client.fetch(`
      *[_type == "school"] {
        _id,
        title,
        slug,
        school_url
      }
    `)

    // Fetch all demands
    const demands = await client.fetch(`
      *[_type == "demand"] {
        _id,
        title,
        slug
      }
    `)

    // Compile all unique tags from projects with full structure
    const tagMap = new Map()
    projects.forEach(project => {
      if (project.allTags && Array.isArray(project.allTags)) {
        project.allTags.forEach(tag => {
          if (tag && typeof tag === 'object' && tag.value) {
            // Handle tag objects with value property - preserve full structure
            if (!tagMap.has(tag.value)) {
              tagMap.set(tag.value, {
                value: tag.value,
                slug: tag.slug || tag.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                label: tag.label || tag.value,
                _id: tag._id || `tag-${tag.value.toLowerCase().replace(/\s+/g, '-')}`
              })
            }
          } else if (tag && typeof tag === 'string') {
            // Handle simple string tags - create structure
            if (!tagMap.has(tag)) {
              tagMap.set(tag, {
                value: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                label: tag,
                _id: `tag-${tag.toLowerCase().replace(/\s+/g, '-')}`
              })
            }
          }
        })
      }
    })

    // Convert Map to sorted array of tag objects
    const uniqueTags = Array.from(tagMap.values()).sort((a, b) => a.value.localeCompare(b.value))

    // Return compiled data
    const filters = {
      tags: uniqueTags,
      institutions: institutions,
      demands: demands
    }

    res.json(filters)
  } catch (error) {
    console.error('Error fetching filters:', error)
    res.status(500).json({ 
      message: 'Error fetching filters',
      error: error.message 
    })
  }
})

// Projects endpoint
app.get('/api/projects', async (req, res) => {
  try {
    // Fetch all projects with their related data
    const projects = await client.fetch(`
      *[_type == "project"] {
        _id,
        title,
        slug,
        poster_image,
        allTags,
        description,
        images[] {
          asset,
          caption
        },
        video_url,
        home_studio-> {
          _id,
          title,
          slug,
          poster_image,
          studio_url,
          institution-> {
            _id,
            title,
            slug,
            school_url
          },
          demands[]-> {
            _id,
            title,
            slug
          },
          instructors,
          term,
          level,
          description
        }
      }
    `)

    // Process images to generate proper URLs
    const processedProjects = projects.map(project => {
      // Process poster image
      if (project.poster_image && project.poster_image.asset) {
        project.poster_image_url = builder
          .image(project.poster_image)
          .width(400)
          .height(300)
          .fit('crop')
          .url()
      }

      // Process additional images - keep both the URLs and the full objects
      if (project.images && Array.isArray(project.images)) {
        project.images_urls = project.images.map(img => {
          if (img.asset) {
            return builder
              .image(img)
              .width(800)
              .height(600)
              .fit('crop')
              .url()
          }
          return null
        }).filter(Boolean)
        
        // Also process images to include captions
        project.images = project.images.map(img => {
          if (img.asset) {
            return {
              asset: img.asset,
              caption: img.caption,
              url: builder
                .image(img)
                .width(800)
                .height(600)
                .fit('crop')
                .url()
            }
          }
          return img
        })
      }

      // Process studio poster image
      if (project.home_studio && project.home_studio.poster_image && project.home_studio.poster_image.asset) {
        project.home_studio.poster_image_url = builder
          .image(project.home_studio.poster_image)
          .width(200)
          .height(150)
          .fit('crop')
          .url()
      }

      return project
    })

    res.json(processedProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ 
      message: 'Error fetching projects',
      error: error.message 
    })
  }
})

// Studios endpoint (for student submission form)
app.get('/api/studios', async (req, res) => {
  try {
    console.log('[API] Fetching studios...')
    const studios = await client.fetch(`
      *[_type == "studio"] | order(title asc) {
        _id,
        title,
        slug,
        institution-> {
          _id,
          title,
          slug,
          school_url
        }
      }
    `)

    if (!Array.isArray(studios)) {
      console.error('[API] Studios query did not return an array:', studios)
      return res.status(500).json({ 
        message: 'Error fetching studios',
        error: 'Invalid response format' 
      })
    }

    console.log(`[API] Found ${studios.length} studios`)
    res.json(studios)
  } catch (error) {
    console.error('[API] Error fetching studios:', error)
    res.status(500).json({ 
      message: 'Error fetching studios',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    })
  }
})

app.post('/api/auth/request-magic-link', async (req, res) => {
  try {
    const { email } = req.body || {}

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const submissionId = await ensureSubmissionDocument(normalizedEmail)

    const magicToken = signMagicLinkToken({
      email: normalizedEmail,
      submissionId,
    })

    const link = `${STUDENT_SUBMISSION_BASE_URL}${
      STUDENT_SUBMISSION_BASE_URL.includes('?') ? '&' : '?'
    }token=${magicToken}`

    await sendMagicLinkEmail(normalizedEmail, link)

    const isDevelopment = process.env.NODE_ENV !== 'production'
    res.json({
      message: isDevelopment
        ? 'Magic link generated. Check the server console if email failed, or use the link below.'
        : 'Magic link sent. Please check your email.',
      submissionId,
      loginUrl: isDevelopment ? link : undefined,
    })
  } catch (error) {
    console.error('Error sending magic link', error)
    res.status(500).json({
      message: 'Unable to send magic link',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    })
  }
})

app.post('/api/auth/verify-magic-link', async (req, res) => {
  try {
    const { token } = req.body || {}

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Magic link token is required' })
    }

    const decoded = verifyToken(token, 'magic')
    const normalizedEmail = decoded.email.trim().toLowerCase()
    const submissionId = await ensureSubmissionDocument(normalizedEmail)

    const sessionToken = signSessionToken({
      email: normalizedEmail,
      submissionId,
    })

    const submission = await client.fetch(
      `*[_id == $submissionId][0] {
        _id,
        _type,
        submittedBy,
        title,
        slug,
        poster_image,
        allStudents,
        allTags,
        home_studio-> {
          _id,
          title,
          slug,
        },
        description,
        media
      }`,
      {
        submissionId,
      },
    )

    // Enhance images
    if (submission) {
      if (submission.poster_image && submission.poster_image.asset) {
        try {
          submission.poster_image.url = builder
            .image(submission.poster_image)
            .width(800)
            .fit('max')
            .url()
        } catch (error) {
          console.warn('Failed to build poster image URL', error)
        }
      }

      if (submission.media && Array.isArray(submission.media)) {
        submission.media = submission.media.map((item) => {
          if (item._type === 'image' && item.asset) {
            try {
              return {
                ...item,
                url: builder.image(item).width(800).fit('max').url(),
              }
            } catch (error) {
              console.warn('Failed to build media image URL', error)
              return item
            }
          }
          return item
        })
      }
    }

    res.json({
      sessionToken,
      submission,
      email: normalizedEmail,
      submissionId,
    })
  } catch (error) {
    console.error('Failed to verify magic link', error)
    res.status(401).json({
      message: 'Unable to verify magic link',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    })
  }
})

app.get('/api/submissions/me', authenticateSession, async (req, res) => {
  try {
    const { submissionId } = req.submissionAuth
    const submission = await client.fetch(
      `*[_id == $submissionId][0] {
        _id,
        _type,
        submittedBy,
        title,
        slug,
        poster_image,
        allStudents,
        allTags,
        home_studio-> {
          _id,
          title,
          slug,
        },
        description,
        media
      }`,
      { submissionId },
    )

    if (submission) {
      // Enhance images in poster_image and media array
      if (submission.poster_image && submission.poster_image.asset) {
        try {
          submission.poster_image.url = builder
            .image(submission.poster_image)
            .width(800)
            .fit('max')
            .url()
        } catch (error) {
          console.warn('Failed to build poster image URL', error)
        }
      }

      if (submission.media && Array.isArray(submission.media)) {
        submission.media = submission.media.map((item) => {
          if (item._type === 'image' && item.asset) {
            try {
              return {
                ...item,
                url: builder.image(item).width(800).fit('max').url(),
              }
            } catch (error) {
              console.warn('Failed to build media image URL', error)
              return item
            }
          }
          return item
        })
      }
    }

    res.json(submission)
  } catch (error) {
    console.error('Failed to fetch submission', error)
    res.status(500).json({ message: 'Failed to fetch submission' })
  }
})

app.put('/api/submissions/me', authenticateSession, async (req, res) => {
  if (!SANITY_WRITE_TOKEN) {
    return res.status(500).json({ message: 'Submissions disabled: SANITY_WRITE_TOKEN missing' })
  }

  try {
    const { submissionId, email } = req.submissionAuth
    const {
      title,
      description,
      poster_image,
      allTags,
      allStudents,
      home_studio,
      media,
    } = req.body || {}

    const normalizedEmail = email.trim().toLowerCase()
    const patch = writeClient.patch(submissionId).setIfMissing({
      _type: 'studentSubmission',
      submittedBy: normalizedEmail,
    })

    const setData = {
      submittedBy: normalizedEmail,
    }

    if (typeof title !== 'undefined') {
      if (typeof title !== 'string') {
        return res.status(400).json({ message: 'Title must be a string' })
      }
      setData.title = title
    }

    if (typeof description !== 'undefined') {
      const normalizedDescription = normalizeDescription(description)
      if (normalizedDescription !== undefined) {
        setData.description = normalizedDescription
      }
    }

    if (typeof poster_image !== 'undefined') {
      const normalizedPosterImage = normalizePosterImage(poster_image)
      if (normalizedPosterImage !== undefined) {
        setData.poster_image = normalizedPosterImage
      } else if (poster_image === null) {
        setData.poster_image = null
      }
    }

    if (typeof allTags !== 'undefined') {
      if (Array.isArray(allTags)) {
        setData.allTags = allTags
      } else {
        return res.status(400).json({ message: 'allTags must be an array' })
      }
    }

    if (typeof allStudents !== 'undefined') {
      // allStudents is a tags field - preserve the structure
      setData.allStudents = allStudents
    }

    if (typeof home_studio !== 'undefined') {
      if (home_studio === null) {
        setData.home_studio = null
      } else if (home_studio._id || typeof home_studio === 'string') {
        setData.home_studio = {
          _type: 'reference',
          _ref: home_studio._id || home_studio,
        }
      }
    }

    if (typeof media !== 'undefined') {
      const normalizedMedia = normalizeMedia(media)
      setData.media = normalizedMedia !== undefined ? normalizedMedia : []
    }

    await patch.set(setData).commit({
      autoGenerateArrayKeys: true,
    })

    // Fetch updated submission with all fields
    const updated = await client.fetch(
      `*[_id == $submissionId][0] {
        _id,
        _type,
        submittedBy,
        title,
        slug,
        poster_image,
        allStudents,
        allTags,
        home_studio-> {
          _id,
          title,
          slug,
        },
        description,
        media
      }`,
      { submissionId },
    )

    if (updated) {
      // Enhance images
      if (updated.poster_image && updated.poster_image.asset) {
        try {
          updated.poster_image.url = builder
            .image(updated.poster_image)
            .width(800)
            .fit('max')
            .url()
        } catch (error) {
          console.warn('Failed to build poster image URL', error)
        }
      }

      if (updated.media && Array.isArray(updated.media)) {
        updated.media = updated.media.map((item) => {
          if (item._type === 'image' && item.asset) {
            try {
              return {
                ...item,
                url: builder.image(item).width(800).fit('max').url(),
              }
            } catch (error) {
              console.warn('Failed to build media image URL', error)
              return item
            }
          }
          return item
        })
      }
    }

    res.json(updated)
  } catch (error) {
    console.error('Failed to update submission', error)
    res.status(500).json({ message: 'Failed to update submission', error: error.message })
  }
})

app.post(
  '/api/submissions/upload-image',
  authenticateSession,
  upload.single('file'),
  async (req, res) => {
    if (!SANITY_WRITE_TOKEN) {
      return res
        .status(500)
        .json({ message: 'Image uploads disabled: SANITY_WRITE_TOKEN missing' })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      const { buffer, mimetype, originalname } = req.file

      const stream = Readable.from(buffer)
      const asset = await writeClient.assets.upload('image', stream, {
        filename: originalname,
        contentType: mimetype,
      })

      res.json({
        assetId: asset._id,
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
        url: asset.url,
      })
    } catch (error) {
      console.error('Failed to upload image', error)
      res.status(500).json({ message: 'Failed to upload image', error: error.message })
    }
  },
)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' })
})

// Root endpoint - show API info
app.get('/', (req, res) => {
  res.json({
    message: 'Superstudio CMS API',
    version: '1.0.0',
    endpoints: {
      filters: '/api/filters',
      projects: '/api/projects',
      studios: '/api/studios',
      health: '/api/health',
      auth: {
        requestMagicLink: '/api/auth/request-magic-link',
        verifyMagicLink: '/api/auth/verify-magic-link',
      },
      submissions: {
        get: '/api/submissions/me',
        update: '/api/submissions/me',
        uploadImage: '/api/submissions/upload-image',
      },
      studio: '/studio'
    }
  })
})

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`)
  console.log(`Available endpoints:`)
  console.log(`- GET /api/filters`)
  console.log(`- GET /api/projects`)
  console.log(`- GET /api/studios`)
  console.log(`- GET /api/health`)
  console.log(`- POST /api/auth/request-magic-link`)
  console.log(`- POST /api/auth/verify-magic-link`)
  console.log(`- GET /api/submissions/me`)
  console.log(`- PUT /api/submissions/me`)
  console.log(`- POST /api/submissions/upload-image`)
  console.log(`- Studio: ${studioExists ? 'Available at /studio' : 'Not built'}`)
})
