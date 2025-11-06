import {defineField, defineType} from 'sanity'

import { IoIosDocument as icon } from "react-icons/io";

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon,
  fields: [
     defineField({
      name: 'poster_image',
      title: 'Poster Image',
      type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              options: {
                isHighlighted: true, // show in main editing view
              },
            },
          ],
        }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'allStudents',
      title: 'Students',
      type: 'tags',
      options: {
        includeFromRelated: 'allStudents'        
      }
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
      to: [{ type: 'studio' }], // assumes you have a "school" schema type defined
    }),

    defineField({
      name: 'allTags',
      title: 'Tags',
      type: 'tags',
      options: {
        includeFromRelated: 'allTags'        
      }
    }),


    defineField({
    name: 'description',
    title: 'Description',
    type: 'array',
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
                isHighlighted: true, // show in main editing view
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
   
  preview: {
    select: {
      title: 'title',
      school: 'releaseDate',
      media: 'poster',
      castName0: 'castMembers.0.person.name',
      castName1: 'castMembers.1.person.name',
    },
    prepare(selection) {
      const year = selection.date && selection.date.split('-')[0]
      const cast = [selection.castName0, selection.castName1].filter(Boolean).join(', ')

      return {
        title: `${selection.title} ${year ? `(${year})` : ''}`,
        date: selection.date,
        subtitle: cast,
        media: selection.media,
      }
    },
  },
})



