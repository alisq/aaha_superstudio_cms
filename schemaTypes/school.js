import { defineType, defineField } from 'sanity';
import { MdSchool as icon } from 'react-icons/md';

export default defineType({
  name: 'school',
  title: 'School',
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
      }
    }),
    defineField({
      name: 'school_url',
      title: 'school URL',
      type: 'url',
    }),
  ],
})
