import { createElement } from 'react';

const withProcessing = () => component => props => {
    props = { ...props }; // unfreeze

    const { data } = props;
    delete props.data;

    const processed = {};

    if (data.hasOwnProperty('allMongodbStudentsReviewClasses')) {
        if (data.allMongodbStudentsReviewClasses.hasOwnProperty('nodes')) {
            processed.courses = data.allMongodbStudentsReviewClasses.nodes;

            if (processed.courses.length !== 0) {
                if (processed.courses[0].hasOwnProperty('block')) {
                    const blocks = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.block)));
                    ['1', '2', '3', '4', '5', '6', '7', '8'].forEach(block => {
                        if (!blocks.includes(String(block))) {
                            blocks.push(String(block));
                        }
                    });
                    blocks.sort((a, b) => +a - +b);
                    processed.blocks = blocks;
                }

                if (processed.courses[0].hasOwnProperty('courseCode')) {
                    processed.codes = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.courseCode)));
                }

                if (processed.courses[0].hasOwnProperty('department')) {
                    const departments = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.department)));

                    if (departments.includes('Miscellaneous') && departments.length > 1) {
                        departments.splice(departments.indexOf('Miscellaneous'), 1);
                    }

                    processed.departments = departments;
                }

                if (processed.courses[0].hasOwnProperty('teacher')) {
                    processed.teachers = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.teacher)));
                }

                if (processed.courses[0].hasOwnProperty('semester')) {
                    processed.semesters = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.semester))).sort((a, b) => {
                        a = /(Spring|Fall)(\d{4})/.exec(a);
                        b = /(Spring|Fall)(\d{4})/.exec(b);
                        return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
                    });
                }
            }
        }

        if (data.allMongodbStudentsReviewClasses.hasOwnProperty('totalCount')) {
            processed.numClasses = data.allMongodbStudentsReviewClasses.totalCount;
        }
    }

    if (data.hasOwnProperty('allMongodbStudentsReviewReviews')) {
        if (data.allMongodbStudentsReviewReviews.hasOwnProperty('nodes')) {
            processed.reviews = data.allMongodbStudentsReviewReviews.nodes;

            if (processed.reviews[0].hasOwnProperty('timestamp')) {
                processed.reviews.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
            }

            if (processed.reviews[0].hasOwnProperty('rating')) {
                processed.rating = processed.reviews.reduce((acc, cur) => acc + cur.rating, 0) / processed.reviews.length;
            }
        }

        if (data.allMongodbStudentsReviewReviews.hasOwnProperty('totalCount')) {
            processed.numReviews = data.allMongodbStudentsReviewReviews.totalCount;
        }
    }

    return createElement(component, Object.freeze(Object.assign(props, processed)));
};

export default withProcessing;
