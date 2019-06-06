import React, { useRef, useState, useEffect } from 'react';
import { Divider, Typography, withStyles } from '@material-ui/core';
import { withApollo } from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import Review from './Review';

import { FIND_REVIEWS, LOAD_ADDITIONAL_REVIEWS, FIND_REVIEW_BY_ID } from '../graphql';
import { hashReview } from '../utils';

import styles from '../styles/styles';

const ReviewDisplay = ({ classes, reviews, client, teacher }) => {
    const headerRef = useRef(null);
    const [linkedReview, setLinkedReview] = useState(null);

    useEffect(() => {
        if (window.location.hash.length > 1) {
            client.query({
                query: FIND_REVIEW_BY_ID,
                variables: {
                    hash: window.location.hash.substr(1)
                }
            })
                .then(({ data: { findOneReview } }) => {
                    setLinkedReview(findOneReview);
                });
        }
    }, []);

    if (reviews && reviews.items.findIndex(review => hashReview(review, teacher) === window.location.hash.substr(1)) !== -1) {
        reviews.items.splice(reviews.items.findIndex(review => hashReview(review, teacher) === window.location.hash.substr(1)), 1);
    }

    return (
        <InfiniteScroll
            pageStart={ 1 }
            initialLoad={ false }
            loader={ <Typography variant='body1' style={ { textAlign: 'center' } } key={ 1 }>Loading More Reviews...</Typography> }
            loadMore={ page => {
                client.query({
                    query: LOAD_ADDITIONAL_REVIEWS,
                    variables: {
                        name: teacher,
                        page
                    }
                })
                    .then(({ data: { reviewPagination: { pageInfo, items, __typename } } }) => {
                        const { reviewPagination, findOneTeacher } = client.cache.readQuery({
                            query: FIND_REVIEWS,
                            variables: {
                                name: teacher
                            }
                        });

                        client.cache.writeQuery({
                            query: FIND_REVIEWS,
                            data: {
                                reviewPagination: {
                                    pageInfo,
                                    items: reviewPagination.items.concat(items),
                                    __typename
                                },
                                findOneTeacher
                            },
                            variables: {
                                name: teacher
                            }
                        });
                    });
            } }
            hasMore={ reviews && reviews.pageInfo.hasNextPage }
        >
            <Typography innerRef={ headerRef } variant='h6' className={ classes.control } style={ { textAlign: 'center' } }>Reviews</Typography>
            {
                linkedReview ? <Review review={ linkedReview } teacher={ teacher }/> : null
            }
            {
                reviews && reviews.items.length > 0 ? reviews.items.map((review, idx) =>
                        <Review key={ idx } review={ review } teacher={ teacher }/>
                ).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.control } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
        </InfiniteScroll>
    );
}

export default withStyles(styles)(withApollo(ReviewDisplay));
