import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {tags} from 'sanity-plugin-tags-v4'

export default defineConfig({
  name: 'default',
  title: 'superstudio_cms',

  projectId: '0c912k6j',
  dataset: 'production',

  basePath: '/studio',

  plugins: [
    structureTool(),
    visionTool(),
    tags({})
  ],

  schema: {
    types: schemaTypes,
  },
  
})
