const slugify = require('slugify');
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;

    const teachers = await graphql(`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    teacher
                }
            }
        }
    `);

    (new Set(teachers.data.allMongodbStudentsReviewClasses.nodes.map(node => node.teacher))).forEach(name => {
        if (name !== 'Undetermined') {
            createPage({
                path: `/teachers/${ slugify(name, { lower: true }) }`,
                component: path.resolve('./src/templates/TeacherPage.js'),
                context: {
                    name
                }
            });
        }
    });

    let courses = await graphql(`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    courseName
                }
            }
        }
    `);

    (new Set(courses.data.allMongodbStudentsReviewClasses.nodes.map(node => node.courseName))).forEach(name => {
        createPage({
            path: `/courses/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/CoursePage.js'),
            context: {
                name
            }
        });
    });
}
