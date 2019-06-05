import gql from 'graphql-tag'

const CREATE_REVIEW = gql`
    mutation($teacher: String!, $rating: Float!, $text: String!) {
        createReview(
            record: {
                teacher: $teacher,
                rating: $rating,
                text: $text
            }
        ) {
            record {
                teacher
                rating
                text
                timestamp
                version
            }
        }
    }
`;

const FIND_REVIEWS = gql`
    query($name: String!) {
        findOneTeacher(filter: {
            name: $name
        }) {
            rating
        }
        reviewPagination(
            filter: {
                teacher: $name
            } 
            sort: TIMESTAMP_DESC
            page: 1
            perPage: 5
        ) {
            pageInfo {
                hasNextPage
            }
            items {
                timestamp
                text
                rating
            }
        }
    }
`;

const LOAD_ADDITIONAL_REVIEWS = gql`
    query($name: String!, $page: Int!) {
        reviewPagination(
            filter: {
                teacher: $name
            } 
            sort: TIMESTAMP_DESC
            page: $page
            perPage: 5
        ) {
            pageInfo {
                hasNextPage
            }
            items {
                timestamp
                text
                rating
            }
        }
    }
`

export {
    CREATE_REVIEW,
    FIND_REVIEWS,
    LOAD_ADDITIONAL_REVIEWS
};
