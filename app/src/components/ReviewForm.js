import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, CircularProgress } from '@material-ui/core';
import { Check, Build } from '@material-ui/icons';
import { Mutation } from 'react-apollo';
import StarRatings from 'react-star-ratings';

import { useTheme, withStyles } from '@material-ui/styles';
import { useStaticQuery, graphql } from 'gatsby';
import { FIND_REVIEWS, CREATE_REVIEW } from '../graphql';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';

import styles from '../styles/styles';

const ReviewForm = ({ classes, teacher, onClose }) => {
    const [reviewText, setReviewText] = useState('');
    const [starRating, setStarRating] = useState(0);

    const theme = useTheme();
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    reviews {
                        minCharacters
                        maxCharacters
                    }
                }
            }
        }
    `);

    const minCharacters = data.site.siteMetadata.reviews.minCharacters;
    const maxCharacters = data.site.siteMetadata.reviews.maxCharacters;

    const inputRestrictions = [
        [reviewText.length < minCharacters, `Reviews must be at least ${ minCharacters } characters.`],
        [reviewText.length > maxCharacters, `Reviews can not be more than ${ maxCharacters } characters.`],
        [starRating === 0, 'Choose a star rating.']
    ];
    const restriction = inputRestrictions.find(restriction => restriction[0]);

    const keyDownHandler = e => {
        if (e.key === 'Escape') {
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    };

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
                            <Build className={ classes.blockIcon } htmlColor='orange'/>
                            <p style={ {
                                textAlign: 'center',
                                color: 'orange'
                            } }>{ error.message }</p>
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
                            <Button disabled={ reviewText.length < minCharacters || starRating === 0 } onClick={ () => {
                                trackCustomEvent({
                                    category: 'Review Form',
                                    action: 'Submit',
                                    label: teacher
                                });
                                createReview({
                                    variables: {
                                        teacher,
                                        rating: starRating,
                                        text: reviewText
                                    }
                                });
                            } }>Submit Review</Button>
                            <br/>
                            {
                                reviewText.length > 0 && restriction ?
                                    <Typography variant='body1' style={ { fontSize: 12, color: 'red' } }>{ restriction[1] }</Typography> :
                                    null
                            }
                        </>
                    );
                }
            } }
        </Mutation>
    );
};

export default withStyles(styles)(ReviewForm);
