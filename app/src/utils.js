const splitSemester = text => /(Spring|Fall)(\d{4})/.exec(text).slice(1).join(' ');
const getCurrentSemester = () => `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
const getBlocks = () => [...Array(8).keys()].map(i => (i + 1).toString());
const removeDupes = array => Array.from(new Set(array));

export {
    splitSemester,
    getCurrentSemester,
    getBlocks,
    removeDupes
};
