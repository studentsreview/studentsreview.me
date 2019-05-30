import { createElement } from 'react';

const WithProcessing = () => component => props => {
    props = { ...props }; // unfreeze

    const { data } = props;
    delete props.data;

    const processed = {};

    if (data.allMongodbStudentsReviewClasses) {
        const blocks = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.block)));
        ['1', '2', '3', '4', '5', '6', '7', '8'].forEach(block => {
            if (!blocks.includes(String(block))) {
                blocks.push(String(block));
            }
        });
        blocks.sort((a, b) => +a - +b);

        processed.blocks = blocks;

        const departments = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.department)));

        if (departments.includes('Miscellaneous') && departments.length > 1) {
            departments.splice(departments.indexOf('Miscellaneous'), 1);
        }

        processed.departments = departments;

        processed.semesters = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.semester))).sort((a, b) => {
            a = /(Spring|Fall)(\d{4})/.exec(a);
            b = /(Spring|Fall)(\d{4})/.exec(b);
            return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
        });

        processed.codes = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.courseCode)));

        processed.courses = data.allMongodbStudentsReviewClasses.nodes;
    }

    if (data.allMongodbStudentsReviewReviews) {
        processed.rating = data.allMongodbStudentsReviewReviews.nodes.reduce((acc, cur) => acc + cur.rating, 0) / data.allMongodbStudentsReviewReviews.nodes.length;

        processed.reviews = data.allMongodbStudentsReviewReviews.nodes.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
    }

    return createElement(component, Object.freeze(Object.assign(props, processed)));
};

export default WithProcessing;
