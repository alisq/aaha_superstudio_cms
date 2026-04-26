import submissions1Raw from './submissions.json';

function pick(obj, keys, fallback = '') {
    for (const k of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined && obj[k] !== null) {
            return obj[k];
        }
    }
    return fallback;
}

function normalizeSubmission(raw) {
    if (!raw || typeof raw !== 'object') return raw;

    const Project_Title = pick(raw, ['Project_Title', 'Project Title', 'ProjectTitle'], '');
    const Project_Description = pick(raw, ['Project_Description', 'Project Description'], '');
    const Student_Names = pick(raw, ['Student_Names', 'Student Name(s)', 'Student Name(s)\n'], '');
    const Home_Studio = pick(raw, ['Home_Studio', 'Home Studio', 'Home Studio\n'], '');
    const Tags = pick(raw, ['Tags'], '');
    const Demands = pick(raw, ['Demands'], '');

    const Video_URL = pick(raw, ['Video_URL', 'Video URL'], '');
    const Video_Caption = pick(raw, ['Video_Caption', 'Video Caption'], '');

    // Prefer already-normalized filenames, then legacy poster fields.
    const poster_image = pick(raw, ['poster_image', 'Poster_Image', 'Poster Image', 'Poster_Image\n'], '');

    const Image_1_Alt = pick(raw, ['Image_1_Alt', 'Image 1 Alt/Description', 'Image 1 Alt/Description\n'], '');
    const Image_1_Caption = pick(raw, ['Image_1_Caption', 'Image 1 Caption'], '');
    const Image_2_Alt = pick(raw, ['Image_2_Alt', 'Image 2 Alt/Description', 'Image 2 Alt/Description\n'], '');
    const Image_2_Caption = pick(raw, ['Image_2_Caption', 'Image 2 Caption'], '');
    const Image_3_Alt = pick(raw, ['Image_3_Alt', 'Image 3 Alt/Description', 'Image 3 Alt/Description\n'], '');
    const Image_3_Caption = pick(raw, ['Image_3_Caption', 'Image 3 Caption'], '');
    const Image_4_Alt = pick(raw, ['Image_4_Alt', 'Image 4 Alt/Description', 'Image 4 Alt/Description\n'], '');
    const Image_4_Caption = pick(raw, ['Image_4_Caption', 'Image 4 Caption'], '');
    const Image_5_Alt = pick(raw, ['Image_5_Alt', 'Image 5 Alt/Description', 'Image 5 Alt/Description\n'], '');
    const Image_5_Caption = pick(raw, ['Image_5_Caption', 'Image 5 Caption'], '');
    const Image_6_Alt = pick(raw, ['Image_6_Alt', 'Image 6 Alt/Description', 'Image 6 Alt/Description\n'], '');
    const Image_6_Caption = pick(raw, ['Image_6_Caption', 'Image 6 Caption'], '');
    const Image_7_Alt = pick(raw, ['Image_7_Alt', 'Image 7 Alt/Description', 'Image 7 Alt/Description\n'], '');
    const Image_7_Caption = pick(raw, ['Image_7_Caption', 'Image 7 Caption'], '');
    const Image_8_Alt = pick(raw, ['Image_8_Alt', 'Image 8 Alt/Description', 'Image 8 Alt/Description\n'], '');
    const Image_8_Caption = pick(raw, ['Image_8_Caption', 'Image 8 Caption'], '');
    const Image_9_Alt = pick(raw, ['Image_9_Alt', 'Image 9 Alt/Description', 'Image 9 Alt/Description\n'], '');
    const Image_9_Caption = pick(raw, ['Image_9_Caption', 'Image 9 Caption'], '');
    const Image_10_Alt = pick(raw, ['Image_10_Alt', 'Image 10 Alt/Description', 'Image 10 Alt/Description\n'], '');
    const Image_10_Caption = pick(raw, ['Image_10_Caption', 'Image 10 Caption'], '');

    return {
        ...raw,
        Project_Title,
        Project_Description,
        Student_Names,
        Home_Studio,
        Tags,
        Demands,
        Video_URL,
        Video_Caption,
        poster_image,
        Image_1_Alt,
        Image_1_Caption,
        Image_2_Alt,
        Image_2_Caption,
        Image_3_Alt,
        Image_3_Caption,
        Image_4_Alt,
        Image_4_Caption,
        Image_5_Alt,
        Image_5_Caption,
        Image_6_Alt,
        Image_6_Caption,
        Image_7_Alt,
        Image_7_Caption,
        Image_8_Alt,
        Image_8_Caption,
        Image_9_Alt,
        Image_9_Caption,
        Image_10_Alt,
        Image_10_Caption
    };
}

function dedupeKey(s) {
    const title = String(s.Project_Title ?? '').trim();
    const students = String(s.Student_Names ?? '').trim();
    return `${title}\0${students}`;
}

const seen = new Set();
const submissionsAll = submissions1Raw
    .map(normalizeSubmission)
    .filter((s) => {
        const k = dedupeKey(s);
        if (!k || k === '\0') return true;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });

export default submissionsAll;

