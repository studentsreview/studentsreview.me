import sha256 from 'sha256';

const splitSemester = text => /(Spring|Fall)(\d{4})/.exec(text).slice(1).join(' ');
const getCurrentSemester = () => `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
const getBlocks = () => ([...Array.from(Array(8).keys())].map(i => (i + 1).toString()));
const removeDupes = array => Array.from(new Set(array));
const hashReview = (review, teacher) => sha256(review.timestamp.concat(review.text).concat(teacher)).substr(0, 10);
const isMigrant = review => new Date(review.timestamp).toISOString() === '0001-01-01T00:00:00.000Z';

export {
    splitSemester,
    getCurrentSemester,
    getBlocks,
    removeDupes,
    hashReview,
    isMigrant
};
