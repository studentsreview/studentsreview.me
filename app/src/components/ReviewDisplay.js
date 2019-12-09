import React, { useRef, useState, useEffect } from 'react';
import { Divider, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { withApollo } from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import Review from './Review';

import { FIND_REVIEWS, LOAD_ADDITIONAL_REVIEWS, FIND_REVIEW_BY_ID } from '../graphql';
import { hashReview } from '../utils';

import styles from '../styles/styles';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics'

const ReviewDisplay = ({ classes, reviews, client, teacher }) => {
    const headerRef = useRef(null);
    const [linkedReview, setLinkedReview] = useState(null);

    const popStateHandler = e => {
        if (e.target.location.hash.length === 11) {
            client.query({
                query: FIND_REVIEW_BY_ID,
                variables: {
                    hash: e.target.location.hash.substr(1)
                }
            })
                .then(({ data: { findOneReview } }) => {
                    setLinkedReview(findOneReview);
                });
        } else {
            setLinkedReview(null);
        }
    }

    useEffect(() => {
        popStateHandler({ target: window });
    }, []);

    useEffect(() => {
        window.addEventListener('popstate', popStateHandler);
        return () => window.removeEventListener('popstate', popStateHandler);
    });

    let filteredReviews;

    if (reviews) {
        filteredReviews = reviews.items.slice();
        if (filteredReviews.findIndex(review => hashReview(review, teacher) === window.location.hash.substr(1)) !== -1) {
            filteredReviews.splice(reviews.items.findIndex(review => hashReview(review, teacher) === window.location.hash.substr(1)), 1);
        }
    }

    return (
        <InfiniteScroll
            pageStart={ 1 }
            initialLoad={ false }
            loader={ <Typography variant='body1' style={ { textAlign: 'center' } } key={ 1 }>Loading More Reviews...</Typography> }
            loadMore={ page => {
                trackCustomEvent({
                    category: 'Review Display',
                    action: 'Scroll',
                    label: teacher,
                    value: page
                });
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
            { linkedReview && <Review review={ linkedReview } teacher={ teacher } selected/> }
            {
                reviews && filteredReviews.length > 0 ? filteredReviews.map((review, idx) =>
                        <Review key={ idx } review={ review } teacher={ teacher }/>
                ).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.control } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
        </InfiniteScroll>
    );
}

export default withStyles(styles)(withApollo(ReviewDisplay));
