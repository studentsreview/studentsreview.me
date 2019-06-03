const slugify = require('slugify');
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;

    const teachers = await graphql(`
        query {
            srapi {
                findManyCourse {
                    teacher
                }
            }
        }
    `);
    (new Set(teachers.data.srapi.findManyCourse.map(course => course.teacher))).forEach(name => {
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
            srapi {
                findManyCourse {
                    name
                }
            }
        }
    `);
    (new Set(courses.data.srapi.findManyCourse.map(course => course.name))).forEach(name => {
        createPage({
            path: `/courses/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/CoursePage.js'),
            context: {
                name
            }
        });
    });
}
