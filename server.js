const express = require('express')
const cors = require('cors')
const path = require('path')
const { createClient } = require('@sanity/client')
const imageUrlBuilder = require('@sanity/image-url')

const app = express()
const port = process.env.PORT || 3000

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Serve Sanity Studio static files from dist directory
const studioPath = path.join(__dirname, 'dist')
// Serve Frontend React app from frontend/build directory
const frontendPath = path.join(__dirname, 'frontend', 'build')
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
  projectId: '0c912k6j',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

// Image URL builder
const builder = imageUrlBuilder(client)

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API server is running' })
})

// Serve Frontend React app - MUST be after all API routes
const frontendExists = fs.existsSync(frontendPath)
console.log(`Frontend path: ${frontendPath}`)
console.log(`Frontend exists: ${frontendExists}`)

if (frontendExists) {
  // Serve static files from React build (CSS, JS, images, etc.)
  app.use(express.static(frontendPath))
  
  // Serve React app for all non-API, non-studio routes
  // This catch-all must be LAST, after all API and studio routes
  app.get('*', (req, res, next) => {
    // Skip API routes (shouldn't reach here, but safety check)
    if (req.path.startsWith('/api/')) {
      return next()
    }
    // Skip studio routes (shouldn't reach here, but safety check)
    if (req.path.startsWith('/studio')) {
      return next()
    }
    // Serve React app for all other routes (SPA routing)
    res.sendFile(path.join(frontendPath, 'index.html'))
  })
} else {
  // Fallback if frontend not built - show API info at root
  app.get('/', (req, res) => {
    res.json({
      message: 'Superstudio CMS API',
      version: '1.0.0',
      endpoints: {
        filters: '/api/filters',
        projects: '/api/projects',
        health: '/api/health',
        studio: '/studio'
      },
      note: 'Frontend not built. Run "npm run build:all" to build frontend and studio.'
    })
  })
}

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`)
  console.log(`Available endpoints:`)
  console.log(`- GET /api/filters`)
  console.log(`- GET /api/projects`)
  console.log(`- GET /api/health`)
  console.log(`- Frontend: ${frontendExists ? 'Served from /' : 'Not built'}`)
  console.log(`- Studio: ${studioExists ? 'Available at /studio' : 'Not built'}`)
})
