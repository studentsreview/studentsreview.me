import React, { Fragment, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import StarRatings from 'react-star-ratings';

import axios from 'axios';

const ReviewForm = ({ teacher, onSubmit }) => {
    const [reviewText, setReviewText] = useState('');
    const [success, setSuccess] = useState(null);
    const [starRating, setStarRating] = useState(0);

    const minCharacters = 50;

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
            <Button disabled={ reviewText.length < minCharacters } onClick={ () => {
                axios.post('/api/submitreview', {
                    teacher: teacher,
                    text: reviewText,
                    rating: starRating
                })
                    .then(res => setSuccess(res.data.success))
                    .catch(() => setSuccess(false));
                setReviewText('');
                setStarRating(0);
                if (typeof onSubmit === 'function') {
                    onSubmit();
                }
            } }>Submit Review</Button>
            <span style={ { fontSize: 12 } }>
                {
                    reviewText.length < minCharacters && reviewText.length > 0 ? <span style={ { color: 'red' } }>Reviews must be at least { minCharacters } characters.</span> :
                        (starRating === 0 && reviewText.length > 0 ? <span style={ { color: 'red' } }>Choose a star rating.</span> :
                            (success === false ? <span style={ { color: 'red' } }>Unable to submit review.</span> :
                                (success === true ? <span style={ { color: 'green' } }>Successfully submitted review.</span> : null
                            )
                        )
                    )
                }
            </span>
            <p style={ { fontSize: 10 } }>Reviews may take a few minutes to appear.</p>
        </Fragment>
    );
};

export default ReviewForm;
