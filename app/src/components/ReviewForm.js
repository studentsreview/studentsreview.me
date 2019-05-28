import React, { Fragment, useEffect, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import StarRatings from 'react-star-ratings';
import IosCheckmarkCircleOutline from 'react-ionicons/lib/IosCheckmarkCircleOutline';
import IosCloseCircleOutline from 'react-ionicons/lib/IosCloseCircleOutline';

import axios from 'axios';

const ReviewForm = ({ teacher, onClose }) => {
    const [reviewText, setReviewText] = useState('');
    const [success, setSuccess] = useState(true);
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

    if (success === false) {
        return (
            <Fragment>
                <IosCloseCircleOutline color='red' fontSize='100px' style={ {
                    display: 'block',
                    margin: 'auto'
                } }/>
                <p style={ {
                    textAlign: 'center',
                    color: 'red'
                } }>Unable to submit review.</p>
            </Fragment>
        );
    } else if (success === true) {
        return (
            <Fragment>
                <IosCheckmarkCircleOutline color='green' fontSize='100px' style={ {
                    display: 'block',
                    margin: 'auto'
                } }/>
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
                        setSuccess(null);
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
                        .then(res => setSuccess(res.data.success))
                        .catch(() => setSuccess(false));
                    setReviewText('');
                    setStarRating(0);
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

export default ReviewForm;
