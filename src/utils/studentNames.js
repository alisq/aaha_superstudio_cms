import { slugify } from './slugify';

export function parseStudentNames(field = '') {
  return String(field)
    .split(/[,+]/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function findSubmissionByStudentName(submissions, name) {
  const targetSlug = slugify(name);
  if (!targetSlug) return null;

  return submissions.find((submission) =>
    parseStudentNames(submission.Student_Names).some(
      (studentName) => slugify(studentName) === targetSlug
    )
  ) || null;
}
