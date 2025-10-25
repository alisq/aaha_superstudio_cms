import { defineType, defineField } from 'sanity'
import { BsExclamationCircle as icon } from 'react-icons/bs';

export default defineType({
  name: 'demand',
  title: 'Demand',
  type: 'document',
  icon,
  fields: [
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
  ],
})
