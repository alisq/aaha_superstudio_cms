const express = require('express')
const cors = require('cors')
const { createClient } = require('@sanity/client')
const imageUrlBuilder = require('@sanity/image-url')

const app = express()
const port = process.env.PORT || 3000

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// Sanity client
const client = createClient({
  projectId: '0c912k6j',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
})

// Image URL builder
const builder = imageUrlBuilder(client)

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Superstudio CMS API',
    version: '1.0.0',
    endpoints: {
      filters: '/api/filters',
      projects: '/api/projects',
      health: '/api/health'
    }
  })
})

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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`)
  console.log(`Available endpoints:`)
  console.log(`- GET /api/filters`)
  console.log(`- GET /api/projects`)
  console.log(`- GET /api/health`)
})
