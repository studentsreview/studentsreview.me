import React, { useEffect, useState } from 'react';
import { Button, TextField, CircularProgress } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons'
import { useTheme, withStyles } from '@material-ui/styles';
import { Mutation } from 'react-apollo';
import StarRatings from 'react-star-ratings';

import { FIND_REVIEWS, CREATE_REVIEW } from '../graphql';

import styles from '../styles/styles';

const ReviewForm = ({ classes, teacher, onClose }) => {
    const [reviewText, setReviewText] = useState('');
    const [starRating, setStarRating] = useState(0);

    const theme = useTheme();

    const minCharacters = 50;

    const keyDownHandler = e => {
        if (e.key === 'Escape') {
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => window.removeEventListener('keydown', keyDownHandler);
    });
    
    return (
        <Mutation
            mutation={ CREATE_REVIEW }
            update={ (cache, { data: { createReview } }) => {
                const { reviewPagination: { pageInfo, items, __typename }, findOneTeacher } = cache.readQuery({
                    query: FIND_REVIEWS,
                    variables: {
                        name: teacher
                    }
                });
                cache.writeQuery({
                    query: FIND_REVIEWS,
                    data: {
                        reviewPagination: {
                            pageInfo,
                            items: [createReview.record].concat(items),
                            __typename
                        },
                        findOneTeacher
                    },
                    variables: {
                        name: teacher
                    }
                });
            } }
        >
            { (createReview, { data, error, loading }) => {
                if (data) {
                    return (
                        <>
                            <Check className={ classes.blockIcon } htmlColor='green'/>
                            <p style={ {
                                textAlign: 'center',
                                color: 'green'
                            } }>Review submitted successfully!</p>
                        </>
                    );
                } else if (error) {
                    return (
                        <>
                            <Close className={ classes.blockIcon } htmlColor='red'/>
                            <p style={ {
                                textAlign: 'center',
                                color: 'red'
                            } }>Unable to submit review.</p>
                        </>
                    );
                } else if (loading) {
                    return <CircularProgress className={ [classes.blockIcon, classes.control] } size={ 100 }/>;
                } else {
                    return (
                        <>
                            <TextField
                                style={ {
                                    width: '100%'
                                } }
                                value={ reviewText }
                                onChange={ e => setReviewText(e.target.value) }
                                rows={ 5 }
                                placeholder={ `Write a review for ${ teacher }...` }
                                multiline
                                margin='normal'
                            />
                            <StarRatings
                                rating={ starRating }
                                changeRating={ setStarRating }
                                starRatedColor='gold'
                                starHoverColor='gold'
                                numberOfStars={ 5 }
                                starDimension={ theme.spacing(5) }
                                starSpacing={ theme.spacing(0.5) }
                            />
                            <br/>
                            <Button disabled={ reviewText.length < minCharacters || starRating === 0 } onClick={ () => createReview({
                                variables: {
                                    teacher: teacher,
                                    rating: starRating,
                                    text: reviewText
                                }
                            }) }>Submit Review</Button>
                            <br/>
                                <span style={ { fontSize: 12 } }>
                                {
                                    reviewText.length < minCharacters && reviewText.length > 0 ? <span style={ { color: 'red' } }>Reviews must be at least { minCharacters } characters.</span> :
                                        (starRating === 0 && reviewText.length > 0 ? <span style={ { color: 'red' } }>Choose a star rating.</span> : null)
                                }
                            </span>
                        </>
                    );
                }
            } }
        </Mutation>
    );
};

export default withStyles(styles)(ReviewForm);
