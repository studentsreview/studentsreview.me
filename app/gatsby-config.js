module.exports = {
    plugins: [
        {
            resolve: `gatsby-source-mongodb`,
            options: { dbName: `StudentsReview`, collection: [`classes`, `reviews`] },
        },
        `gatsby-plugin-jss`,
        `gatsby-plugin-material-ui`
    ]
}
