// /schemas/studentSubmission.js
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'studentSubmission',
  title: 'Student Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'submittedBy',
      title: 'Submitted By (email)',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'poster_image',
      title: 'Poster Image',
      type: 'image',
      validation: Rule => Rule.required(),
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          options: {
            isHighlighted: true,
          },
        },
      ],
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'allStudents',
      title: 'Students',
      type: 'tags',
      options: {
        includeFromRelated: 'allStudents',
      },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 100,
      },
    }),
    defineField({
      name: 'home_studio',
      title: 'Home Studio',
      type: 'reference',
      to: [{ type: 'studio' }],
    }),
    defineField({
      name: 'allTags',
      title: 'Tags',
      type: 'array',
      validation: Rule => Rule.required(),
      of: [{type: 'string'}],
      options: {
        layout: 'grid',
        list: [
          {title: 'Community land trusts', value: 'Community land trusts'},
          {title: 'Cooperative housing', value: 'Cooperative housing'},
          {title: 'Decolonization', value: 'Decolonization'},
          {title: 'Financialization', value: 'Financialization'},
          {title: 'Housing design', value: 'Housing design'},
          {title: 'Housing policy', value: 'Housing policy'},
          {title: 'Housing theory', value: 'Housing theory'},
          {title: 'Indigeneity', value: 'Indigeneity'},
          {title: 'Pedagogy', value: 'Pedagogy'},
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      validation: Rule => Rule.required(),
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'URL',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      validation: Rule => Rule.max(10),
      of: [
        {
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              options: {
                isHighlighted: true,
              },
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
        {
          type: 'object',
          name: 'video',
          title: 'Video URL',
          fields: [
            {
              name: 'video_url',
              title: 'Video URL',
              type: 'url',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
          preview: {
            select: {
              url: 'video_url',
            },
            prepare({ url }) {
              return {
                title: 'Video',
                subtitle: url || 'No URL provided',
              }
            },
          },
        },
      ],
    }),
  ],
})
