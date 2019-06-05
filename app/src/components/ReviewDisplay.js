import React, { useRef, useEffect } from 'react';
import { Divider, Typography, withStyles } from '@material-ui/core';
import { withApollo } from 'react-apollo';
import InfiniteScroll from 'react-infinite-scroller';
import IosArrowDropup from 'react-ionicons/lib/IosArrowDropup';
import Review from './Review';

import { FIND_REVIEWS, LOAD_ADDITIONAL_REVIEWS } from '../graphql';

import styles from '../styles/styles';

const ReviewDisplay = ({ classes, reviews, client, teacher }) => {
    const headerRef = useRef(null);

    useEffect(() => {
        if (window.location.hash) {

        }
    }, []);

    return (
        <InfiniteScroll
            pageStart={ 1 }
            threshold={ 10 }
            initialLoad={ false }
            loader={ <Typography variant='body1' style={ { textAlign: 'center' } }>Loading More Reviews...</Typography> }
            loadMore={ page => {
                client.query({
                    query: LOAD_ADDITIONAL_REVIEWS,
                    variables: {
                        name: teacher,
                        page
                    }
                })
                    .then(({ data: { reviewPagination: { pageInfo, items, __typename } } }) => {
                        console.log(pageInfo, items, page);
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
            <Typography innerRef={ headerRef } variant='h6' className={ classes.majorCard } style={ { textAlign: 'center' } }>Reviews</Typography>
            {
                reviews && reviews.items.length > 0 ? reviews.items.map((review, idx) =>
                    <Review key={ idx } review={ review }/>
                ).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.majorCard } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
            <IosArrowDropup fontSize='50px' onClick={ () => headerRef.current.scrollIntoView({
                behavior: 'smooth'
            }) } style={ {
                position: 'fixed',
                left: 0,
                bottom: 0,
                cursor: 'pointer',
                background: '#fff'
            } }/>
        </InfiniteScroll>
    );
}

export default withStyles(styles)(withApollo(ReviewDisplay));
