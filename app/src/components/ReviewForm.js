import React, { Fragment, useState } from 'react';
import { Button, TextField } from '@material-ui/core'
import axios from 'axios';

const ReviewForm = ({ teacher }) => {
    const [reviewText, setReviewText] = useState('');
    const [success, setSuccess] = useState(null);

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
            <Button disabled={ reviewText.length < 100 } onClick={ () => {
                axios.post('/api/submitreview', {
                    teacher: teacher,
                    text: reviewText
                })
                    .then(res => setSuccess(res.data.success))
                    .catch(() => setSuccess(false));
                setReviewText('');
            } }>Submit Review</Button>
            <span style={ { fontSize: 12 } }>
                {
                    reviewText.length < 100 && reviewText.length > 0 ? <span style={ { color: 'red' } }>
                    Reviews must be at least 100 characters.
                </span> : (
                        success === false ? <span style={ { color: 'red' } }>
                    Unable to submit review.
                </span> : (
                            success === true ? <span style={ { color: 'green' } }>
                        Successfully submitted review.
                </span> : null
                        )
                    )
                }
            </span>
            <p style={ { fontSize: 10 } }>Reviews may a few minutes to appear.</p>
        </Fragment>
    );
};

export default ReviewForm;
