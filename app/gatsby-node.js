const slugify = require('slugify');
const path = require('path');

module.exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions;

    graphql(`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    Teacher
                }
            }
        }
    `).then(result => {
        (new Set(result.data.allMongodbStudentsReviewClasses.nodes.map(node => node.Teacher))).forEach(name => {
            createPage({
                path: `/teachers/${ slugify(name, { lower: true }) }`,
                component: path.resolve('./src/templates/TeacherPage.js'),
                context: {
                    name
                }
            });
        })
    })
}
