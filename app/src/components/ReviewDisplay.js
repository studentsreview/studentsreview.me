import React, { Fragment, useRef, useState } from 'react';
import { Button, Divider, Grid, Typography, withStyles } from '@material-ui/core';
import Review from './Review';

import sha256 from 'sha256';

import styles from '../styles/styles';

const ReviewDisplay = ({ classes, reviews }) => {
    let initialPage = 0;

    if (window.location.hash) {
        const idx = reviews.findIndex(review => sha256(review.timestamp.toString().concat(review.text)).substr(0, 10) === window.location.hash.substr(1));
        if (idx !== -1) {
            initialPage = Math.floor(idx / 5);
        }
    }

    const [pageNumber, setPageNumber] = useState(initialPage);
    const reviewsRef = useRef(null);

    reviews.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

    return (
        <Fragment>
            <Typography innerRef={ reviewsRef }  variant='h6' className={ classes.card } style={ { textAlign: 'center' } }>Reviews</Typography>
            {
                reviews.length > 0 ? reviews.slice(pageNumber * 5, (pageNumber + 1) * 5).map((review, idx) =>
                    <Review key={ idx } review={ review }/>
                ).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.card } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
            <Grid container className={ classes.card } direction='row' justify='space-between'>
                <Button disabled={ pageNumber === 0 } onClick={ () => {
                    setPageNumber(pageNumber - 1);
                    reviewsRef.current.scrollIntoView();
                } }>Previous Page</Button>
                <Button disabled={ (pageNumber + 1) * 5 >= reviews.length } onClick={ () => {
                    setPageNumber(pageNumber + 1);
                    reviewsRef.current.scrollIntoView();
                } }>Next Page</Button>
            </Grid>
        </Fragment>
    );
}

export default withStyles(styles)(ReviewDisplay);
