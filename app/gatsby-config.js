module.exports = {
    plugins: [
        {
            resolve: `gatsby-source-mongodb`,
            options: { dbName: `StudentsReview`, collection: [`classes`, `reviews`] },
        },
        {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
                trackingId: `UA-140917974-1`,
            }
        },
        `gatsby-plugin-jss`,
        `gatsby-plugin-material-ui`,
        `gatsby-plugin-remove-trailing-slashes`
    ],
    proxy: {
        prefix: `/api`,
        url: `http://localhost:8080`
    }
}
