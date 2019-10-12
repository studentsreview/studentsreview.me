const path = require('path');

module.exports = {
    plugins: [
        {
            resolve: `gatsby-source-graphql`,
            options: {
                typeName: `StudentsReview`,
                fieldName: `srapi`,
                url: process.env.GRAPHQL_URI || 'http://localhost:8080'
            }
        },
        {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
                trackingId: `UA-140917974-1`,
            }
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                name: `images`,
                path: path.join(__dirname, `src`, `images`),
            }
        },
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
                name: `StudentsReview`,
                short_name: `StudentsReview`,
                start_url: `/`,
                background_color: `#fff`,
                theme_color: `#c62828`,
                display: `standalone`,
                icon: `src/favicon.png`
            }
        },
        `gatsby-transformer-sharp`,
        `gatsby-plugin-material-ui`,
        `gatsby-plugin-remove-trailing-slashes`,
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-favicon`,
        `gatsby-plugin-sharp`,
        `gatsby-plugin-offline`
    ],
    siteMetadata: require('../config/config')
}
