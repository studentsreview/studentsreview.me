import sha256 from 'sha256';
import { isIOS } from 'react-device-detect';

import { useTheme } from '@material-ui/styles';
import { useMediaQuery } from '@material-ui/core';

import config from '../../config/site_config';

const semesterValue = semester => {
    const match = /(Spring|Fall)(\d{4})/.exec(semester);
    return Number(match[2]) + (match[1] === 'Spring' ? 0 : 0.5);
}
const splitSemester = text => /(Spring|Fall)(\d{4})/.exec(text).slice(1).join(' ');
const getCurrentSemester = () => `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
const getBlocks = () => ([...Array.from(Array(8).keys())].map(i => (i + 1).toString()));
const removeDupes = array => Array.from(new Set(array));
const getReviewId = (review, teacher) => sha256(review.timestamp.concat(review.text).concat(teacher));
const hashReview = (review, teacher) => getReviewId(review, teacher).substr(0, 10);
const isMigrant = review => new Date(review.timestamp).toISOString() === '0001-01-01T00:00:00.000Z';
const sortSemesters = semesters => semesters.sort((a, b) => semesterValue(b) - semesterValue(a));
const formatSemesterRange = semesters => semesters.length === 1 ?  (semesters[0] !== config.announcers[0] ? splitSemester(semesters[0]) : 'Pre-'.concat(splitSemester(config.announcers[0]))) :
    `${ semesters[semesters.length - 1] !== config.announcers[0] ? splitSemester(semesters[semesters.length - 1]) : 'Pre-'.concat(splitSemester(config.announcers[0])) } - ${ splitSemester(semesters[0]) }`;
const copyToClipboard = (target, text) => {
    const textField = document.createElement('textarea');
    target.appendChild(textField);
    textField.innerText = text;
    if (isIOS) {
        const range = document.createRange();
        range.selectNodeContents(textField);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        textField.setSelectionRange(0, 999999);
    } else {
        textField.select();
    }
    document.execCommand('copy');
    textField.remove();
}

const useWidth = () => {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();
    return (
        keys.reduce((output, key) => {
            const matches = useMediaQuery(theme.breakpoints.up(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
}
const combineStyles = (...styles) => {
    return function CombineStyles(theme) {
        const outStyles = styles.map((arg) => {
            // Apply the "theme" object for style functions.
            if (typeof arg === 'function') {
                return arg(theme);
            }
            // Objects need no change.
            return arg;
        });

        return outStyles.reduce((acc, val) => Object.assign(acc, val));
    };
}

export {
    semesterValue,
    splitSemester,
    getCurrentSemester,
    getBlocks,
    removeDupes,
    getReviewId,
    hashReview,
    isMigrant,
    sortSemesters,
    formatSemesterRange,
    copyToClipboard,
    useWidth,
    combineStyles
};
