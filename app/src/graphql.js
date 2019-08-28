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

const CREATE_REPORT = gql`
    mutation($review: String!, $reason: EnumReportReason!) {
        createReport(
            record: {
                review: $review
                reason: $reason
            }
        ) {
            record {
                review
                reason
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
            perPage: 15
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
            perPage: 15
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

const FIND_REVIEW_BY_ID = gql`
    query($hash: String!) {
        findOneReview(
            filter: {
                hash: $hash
            }
        ) {
            timestamp
            text
            rating
        }
    }
`;

const FIND_LATEST_REVIEWS = gql`
    query {
        findManyReview(
            limit: 5
            sort: TIMESTAMP_DESC
        ) {
            teacher
            timestamp
            text
            rating
        }
    }
`;

export {
    CREATE_REVIEW,
    CREATE_REPORT,
    FIND_REVIEWS,
    LOAD_ADDITIONAL_REVIEWS,
    FIND_REVIEW_BY_ID,
    FIND_LATEST_REVIEWS
};
