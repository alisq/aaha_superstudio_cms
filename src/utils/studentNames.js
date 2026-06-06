export function parseStudentNames(field = '') {
  return String(field)
    .split(/[,+]/)
    .map((name) => name.trim())
    .filter(Boolean);
}
