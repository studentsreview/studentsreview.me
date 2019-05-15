module.exports = {
    plugins: [
        {
            resolve: `gatsby-source-mongodb`,
            options: { dbName: `StudentsReview`, collection: `classes` },
        },
        `gatsby-plugin-jss`,
        `gatsby-plugin-material-ui`
    ]
}
