# API Endpoints Documentation

This document describes the JSON API endpoints available for the frontend.

## Endpoints

### 1. `/api/filters`
Returns compiled filter data for frontend filtering.

**Method:** GET  
**Response:**
```json
{
  "tags": ["tag1", "tag2", "tag3"],
  "institutions": [
    {
      "_id": "school-id",
      "title": "School Name",
      "slug": { "current": "school-slug" },
      "school_url": "https://school.edu"
    }
  ],
  "demands": [
    {
      "_id": "demand-id", 
      "title": "Demand Title",
      "slug": { "current": "demand-slug" }
    }
  ]
}
```

### 2. `/api/projects`
Returns all projects with their related data.

**Method:** GET  
**Response:**
```json
[
  {
    "_id": "project-id",
    "title": "Project Title",
    "slug": { "current": "project-slug" },
    "poster_image": { /* image object */ },
    "allTags": ["tag1", "tag2"],
    "description": [ /* block content */ ],
    "images": [ /* array of images */ ],
    "video_url": "https://video.url",
    "home_studio": {
      "_id": "studio-id",
      "title": "Studio Title",
      "slug": { "current": "studio-slug" },
      "poster_image": { /* image object */ },
      "studio_url": "https://studio.url",
      "institution": {
        "_id": "school-id",
        "title": "School Name",
        "slug": { "current": "school-slug" },
        "school_url": "https://school.edu"
      },
      "demands": [
        {
          "_id": "demand-id",
          "title": "Demand Title", 
          "slug": { "current": "demand-slug" }
        }
      ],
      "instructors": ["Instructor 1", "Instructor 2"],
      "term": ["fall_2025"],
      "level": ["undergraduate"],
      "description": [ /* block content */ ]
    }
  }
]
```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test the endpoints:
   ```bash
   node test-api.js
   ```

3. Use in your frontend:
   ```javascript
   // Fetch filter data
   const filters = await fetch('/api/filters').then(r => r.json())
   
   // Fetch all projects
   const projects = await fetch('/api/projects').then(r => r.json())
   ```

## Data Structure

- **Tags**: Extracted from the `allTags` field in projects
- **Institutions**: All schools from the `school` document type
- **Demands**: All demands from the `demand` document type
- **Projects**: All projects with populated references to studios, schools, and demands
