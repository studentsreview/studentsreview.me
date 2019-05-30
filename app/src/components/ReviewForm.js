import React, { Fragment, useEffect, useState } from 'react';
import { Button, TextField, withStyles } from '@material-ui/core';
import StarRatings from 'react-star-ratings';
import IosCheckmarkCircleOutline from 'react-ionicons/lib/IosCheckmarkCircleOutline';
import IosCloseCircleOutline from 'react-ionicons/lib/IosCloseCircleOutline';
import IosInfinite from 'react-ionicons/lib/IosInfinite';

import axios from 'axios';

import styles from '../styles/styles';

const PENDING = 'PENDING';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const NONE = 'NONE';

const SubmissionState = {
    PENDING,
    SUCCESS,
    FAILURE,
    NONE
};

const ReviewForm = ({ classes, teacher, onClose }) => {
    const [reviewText, setReviewText] = useState('');
    const [submissionState, setSubmissionState] = useState(SubmissionState.NONE);
    const [starRating, setStarRating] = useState(0);

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

    if (submissionState === SubmissionState.PENDING) {
        return <IosInfinite className={ classes.blockIcon } fontSize='100px' rotate={ true }/>;
    } else if (submissionState === SubmissionState.FAILURE) {
        return (
            <Fragment>
                <IosCloseCircleOutline className={ classes.blockIcon } color='red' fontSize='100px'/>
                <p style={ {
                    textAlign: 'center',
                    color: 'red'
                } }>Unable to submit review.</p>
            </Fragment>
        );
    } else if (submissionState === SubmissionState.SUCCESS) {
        return (
            <Fragment>
                <IosCheckmarkCircleOutline className={ classes.blockIcon } color='green' fontSize='100px'/>
                <p style={ {
                    textAlign: 'center',
                    color: 'green'
                } }>Review submitted successfully!</p>
            </Fragment>
        );
    } else {
        return (
            <Fragment>
                <TextField
                    style={ {
                        width: '100%'
                    } }
                    value={ reviewText }
                    onChange={ e => {
                        setReviewText(e.target.value);
                        setSubmissionState(SubmissionState.NONE);
                    } }
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
                    starDimension={ 25 }
                    starSpacing={ 2.5 }
                />
                <br/>
                <Button disabled={ reviewText.length < minCharacters && starRating > 0 } onClick={ () => {
                    axios.post('/api/submitreview', {
                        teacher: teacher,
                        text: reviewText,
                        rating: starRating
                    })
                        .then(res => setSubmissionState(res.data.status === 200 ? SubmissionState.SUCCESS : SubmissionState.FAILURE))
                        .catch(res => setSubmissionState(res.data.status === 200 ? SubmissionState.SUCCESS : SubmissionState.FAILURE));
                    setReviewText('');
                    setStarRating(0);
                    setSubmissionState(SubmissionState.PENDING);
                } }>Submit Review</Button>
                <span style={ { fontSize: 12 } }>
                {
                    reviewText.length < minCharacters && reviewText.length > 0 ? <span style={ { color: 'red' } }>Reviews must be at least { minCharacters } characters.</span> :
                        (starRating === 0 && reviewText.length > 0 ? <span style={ { color: 'red' } }>Choose a star rating.</span> : null
                        )
                }
                </span>
                <p style={ { fontSize: 10 } }>Reviews may take a few minutes to appear.</p>
            </Fragment>
        );
    }
};

export default withStyles(styles)(ReviewForm);
