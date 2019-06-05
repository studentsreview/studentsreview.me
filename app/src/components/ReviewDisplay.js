import React, { useRef, useState, useEffect } from 'react';
import { Divider, Typography, withStyles } from '@material-ui/core';
import InfiniteScroll from 'react-infinite-scroller';
import IosArrowDropup from 'react-ionicons/lib/IosArrowDropup';
import Review from './Review';

import sha256 from 'sha256';

import styles from '../styles/styles';

const ReviewDisplay = ({ classes, reviews }) => {
    let initialPage = 0;

    const [pageNumber, setPageNumber] = useState(initialPage);
    const headerRef = useRef(null);

    const splitIdx = reviews.findIndex(review => new Date(review.timestamp).toString() === new Date('0001-01-01T00:00:00.000Z').toString());
    reviews = reviews.slice(0, splitIdx).concat(reviews.slice(splitIdx).reverse());

    useEffect(() => {
        if (window.location.hash) {
            const idx = reviews.findIndex(review => sha256(review.timestamp.concat(review.text)).substr(0, 10) === window.location.hash.substr(1));
            if (idx !== -1) {
                initialPage = Math.floor(idx / 5);
            }
        }
    }, [reviews]);

    return (
        <InfiniteScroll
            startPage={ initialPage }
            threshold={ 10 }
            loadMore={ setPageNumber }
            hasMore={ (pageNumber + 1) * 5 < reviews.length }
        >
            <Typography innerRef={ headerRef } variant='h6' className={ classes.majorCard } style={ { textAlign: 'center' } }>Reviews</Typography>
            {
                reviews.length > 0 ? reviews.slice(0, (pageNumber + 1) * 5).map((review, idx) =>
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

export default withStyles(styles)(ReviewDisplay);
