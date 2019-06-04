import gql from 'graphql-tag'

const CREATE_REVIEW = gql`
    mutation($teacher: String!, $rating: Float!, $text: String!) {
        createReview(record: {
            teacher: $teacher,
            rating: $rating,
            text: $text
        }) {
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

const FIND_MANY_REVIEW = gql`
    query($name: String!) {
        findManyReview(filter: {
            teacher: $name
        } sort: TIMESTAMP_DESC) {
            timestamp
            text
            rating
        }
    }
`;

export {
    CREATE_REVIEW,
    FIND_MANY_REVIEW
};
