import sha256 from 'sha256';

const splitSemester = text => /(Spring|Fall)(\d{4})/.exec(text).slice(1).join(' ');
const getCurrentSemester = () => `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
const getBlocks = () => ([...Array.from(Array(8).keys())].map(i => (i + 1).toString()));
const removeDupes = array => Array.from(new Set(array));
const getReviewId = (review, teacher) => sha256(review.timestamp.concat(review.text).concat(teacher));
const hashReview = (review, teacher) => sha256(review.timestamp.concat(review.text).concat(teacher)).substr(0, 10);
const isMigrant = review => new Date(review.timestamp).toISOString() === '0001-01-01T00:00:00.000Z';
const sortSemesters = semesters => semesters.sort((a, b) => {
    a = /(Spring|Fall)(\d{4})/.exec(a);
    b = /(Spring|Fall)(\d{4})/.exec(b);
    return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
});

export {
    splitSemester,
    getCurrentSemester,
    getBlocks,
    removeDupes,
    getReviewId,
    hashReview,
    isMigrant,
    sortSemesters
};
