const slugify = require('slugify');
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
    const { createPage } = actions;

    const teachers = await graphql(`
        query {
            srapi {
                findManyTeacher {
                    name
                }
            }
        }
    `);
    teachers.data.srapi.findManyTeacher.map(teacher => teacher.name).forEach(name => {
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
    courses.data.srapi.findManyCourse.map(course => course.name).forEach(name => {
        createPage({
            path: `/courses/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/CoursePage.js'),
            context: {
                name
            }
        });
    });
}
