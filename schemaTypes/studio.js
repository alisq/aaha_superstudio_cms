import {defineField, defineType} from 'sanity'
import { FaBuilding as icon} from 'react-icons/fa';

export default defineType({
  name: 'studio',
  title: 'Studio',
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
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      name: 'studio_url',
      title: 'Studio URL',
      type: 'url',
    }),
    defineField({
      name: 'institution',
      title: 'Institution',
      type: 'reference',
      to: [{ type: 'school' }], // assumes you have a "school" schema type defined
    }),

    defineField({
      name: 'demands',
      title: 'Demands',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'demand' }],
        },
      ],
    }),
    defineField({
      name: 'instructors',
      title: 'Instructor(s)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'term',
      title: 'Term',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Fall 2025', value: 'fall_2025' },
          { title: 'Winter 2026', value: 'winter_2026' }
        ],
        layout: 'checkbox', 
      },
    }),
     defineField({
      name: 'level',
      title: 'Level',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Undergraduate', value: 'undergraduate' },
          { title: 'Graduate', value: 'graduate' }
        ],
        layout: 'checkbox', 
      },
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
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
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
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    })

    


  ],
preview: {
  select: {
    title: 'title',
    institutionTitle: 'institution.title',   // deref to school's title
    instructors: 'instructors',               // array of strings
    media: 'poster_image',                    // ✅ matches your field name
  },
  prepare({ title, institutionTitle, instructors = [], media }) {
    const subtitle = Array.isArray(instructors) ? instructors.join(', ') : (instructors || '');
    return {
      title: [title, institutionTitle].filter(Boolean).join(' — '),
      subtitle,
      media,
    };
  },
}

})



