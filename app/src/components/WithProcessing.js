import { createElement } from 'react';

const WithProcessing = () => component => props => {
    props = { ...props }; // unfreeze

    const { data } = props;
    delete props.data;

    const processed = {};

    if (data.allMongodbStudentsReviewClasses) {
        const blocks = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Block)));
        ['1', '2', '3', '4', '5', '6', '7', '8'].forEach(block => {
            if (!blocks.includes(String(block))) {
                blocks.push(String(block));
            }
        });
        blocks.sort((a, b) => +a - +b);

        processed.blocks = blocks;

        const departments = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Department)));

        if (departments.includes('Miscellaneous') && departments.length > 1) {
            departments.splice(departments.indexOf('Miscellaneous'), 1);
        }

        processed.departments = departments;

        processed.semesters = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Semester))).sort((a, b) => {
            a = /(Spring|Fall)(\d{4})/.exec(a);
            b = /(Spring|Fall)(\d{4})/.exec(b);
            return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
        });

        processed.courses = data.allMongodbStudentsReviewClasses.nodes;
    }

    if (data.allMongodbStudentsReviewReviews) {
        processed.reviews = data.allMongodbStudentsReviewReviews.nodes.map(node => node.Text);
    }

    return createElement(component, Object.freeze(Object.assign(props, processed)));
};

export default WithProcessing;
