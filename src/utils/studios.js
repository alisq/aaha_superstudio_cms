import studiosData from '../data/studios.json';
import { slugify } from './slugify';

export function parseHomeStudio(homeStudio = '') {
  const value = String(homeStudio).trim();
  if (!value) return { title: '', school: '' };

  const parts = value.split(' — ');
  return {
    title: (parts[0] || '').trim(),
    school: (parts.slice(1).join(' — ') || '').trim(),
  };
}

function buildStudioLookups() {
  const byTitle = new Map();
  const bySlug = new Map();

  studiosData.forEach((studio) => {
    const keys = [
      (studio.title || '').trim(),
      ...(studio.aliases || []),
    ].filter(Boolean);

    keys.forEach((key) => {
      byTitle.set(key.toLowerCase(), studio);
      bySlug.set(slugify(key), studio);
    });
  });

  return { byTitle, bySlug };
}

const studioLookups = buildStudioLookups();

export function matchStudioFromHomeStudio(homeStudio) {
  const { title } = parseHomeStudio(homeStudio);
  if (!title) return null;

  return (
    studioLookups.byTitle.get(title.toLowerCase()) ||
    studioLookups.bySlug.get(slugify(title)) ||
    null
  );
}

export function getStudioFilterClass(studioOrTitle) {
  const title =
    typeof studioOrTitle === 'string'
      ? studioOrTitle.trim()
      : (studioOrTitle?.title || '').trim();
  return title ? `s_${slugify(title)}` : '';
}

export function getSubmissionStudioFilterClass(homeStudio) {
  const studio = matchStudioFromHomeStudio(homeStudio);
  if (studio) return getStudioFilterClass(studio);

  const { title } = parseHomeStudio(homeStudio);
  return getStudioFilterClass(title);
}

export function formatStudioLabel(studio) {
  return `${(studio.title || '').trim()} — ${(studio.school || '').trim()}`;
}

export function getStudiosWithSubmissions(submissions) {
  const matchedStudios = new Set();

  submissions.forEach((submission) => {
    const studio = matchStudioFromHomeStudio(submission.Home_Studio);
    if (studio) matchedStudios.add(studio);
  });

  return studiosData.filter((studio) => matchedStudios.has(studio));
}

export { studiosData };
