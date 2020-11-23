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
    teachers.data.srapi.findManyTeacher.forEach(({ name }) => {
        if (name !== 'Undetermined') {
            /*
            createPage({
                path: `/teachers/${ slugify(name, { lower: true }) }`,
                component: path.resolve('./src/templates/TeacherPage.js'),
                context: { name }
            });
            */
        }
    });

    const courses = await graphql(`
        query {
            srapi {
                findManyCourse {
                    name
                }
            }
        }
    `);
    courses.data.srapi.findManyCourse.forEach(({ name }) => {
        /*
        createPage({
            path: `/courses/${ slugify(name, { lower: true }) }`,
            component: path.resolve('./src/templates/CoursePage.js'),
            context: { name }
        });
        */
    });

    const announcers = await graphql(`
        query {
            site {
                siteMetadata {
                    announcers
                }
            }
        }
    `);
    announcers.data.site.siteMetadata.announcers.map(semester => {
        /*
        createPage({
            path: `/announcers/${ semester.toLowerCase() }`,
            component: path.resolve('./src/templates/AnnouncerPage.js'),
            context: { semester }
        });
        */
    });
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
    if (stage === 'build-html') {
        actions.setWebpackConfig({
            module: {
                rules: [
                    {
                        test: /mermaid/,
                        use: loaders.null()
                    }
                ]
            }
        })
    }
}
