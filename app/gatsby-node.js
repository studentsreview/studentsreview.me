const slugify = require('slugify');
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;

    const teachers = await graphql(`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    Teacher
                }
            }
        }
    `);

    (new Set(teachers.data.allMongodbStudentsReviewClasses.nodes.map(node => node.Teacher))).forEach(name => {
        createPage({
            path: `/teachers/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/TeacherPage.js'),
            context: {
                name
            }
        });
    });

    let courses = await graphql(`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    Course_Name
                }
            }
        }
    `);

    (new Set(courses.data.allMongodbStudentsReviewClasses.nodes.map(node => node.Course_Name))).forEach(name => {
        createPage({
            path: `/courses/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/CoursePage.js'),
            context: {
                name
            }
        });
    });
}
