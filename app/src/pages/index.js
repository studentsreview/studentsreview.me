import React, { useEffect, useRef, useState } from 'react'
import { Button, MenuItem, Paper, Popper, TextField, Grid } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import CountUp from 'react-countup';
import withProcessing from '../components/hoc/withProcessing';
import withRoot from '../components/hoc/withRoot';

import { graphql } from 'gatsby';
import slugify from 'slugify';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { navigate } from '@reach/router';

const IndexPage = ({ teachers, courseNames, numClasses, numReviews, theme }) => {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    if (teachers.indexOf('Undetermined') !== -1) {
        teachers.splice(teachers.indexOf('Undetermined'), 1);
    }

    const items = teachers.concat(courseNames);
    const suggestions = items.filter(item => match(item, value).length > 0).sort((a, b) => match(b, value).length - match(a, value).length).slice(0, 5);

    const keyDownHandler = e => {
        if (e.key === 'Enter') {
            if (teachers.includes(value)) {
                navigate(`/teachers/${ slugify(value, { lower: true }) }`);
            } else if (courseNames.includes(value)) {
                navigate(`/courses/${ slugify(value, { lower: true }) }`);
            }
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => window.removeEventListener('keydown', keyDownHandler);
    });

    return (
        <Grid container direction='column' justify='center' alignItems='center' style={ {
            minHeight: '70%',
            textAlign: 'center'
        } }>
            <Helmet>
                <title>Students Review</title>
                <meta name='description' content='Students Review is a education website for students to share and read reviews of courses and teachers at Lowell High School.'/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Review'].join(',') }/>
            </Helmet>
            <h2>Lowell High School Teacher Reviews</h2>
            <div>
                <CountUp
                    end={ teachers.length }
                    formattingFn={ num => `${ num.toLocaleString() } Teachers, ` }
                />
                <CountUp
                    end={ numClasses }
                    formattingFn={ num => `${ num.toLocaleString() } Classes, ` }
                />
                <CountUp
                    end={ numReviews }
                    formattingFn={ num => `${ num.toLocaleString() } Reviews` }
                />
            </div>
            <TextField
                style={ {
                    marginTop: theme.spacing(10),
                    width: 760,
                    maxWidth: '75vw'
                } }
                inputRef={ inputRef }
                value={ value }
                onChange={ e => setValue(e.target.value) }
                inputProps={ {
                    onKeyDown: e => {
                        if (e.key === 'Enter') {
                            if (teachers.includes(value)) {
                                navigate(`/teachers/${ slugify(value, { lower: true }) }`);
                            } else if (courseNames.includes(value)) {
                                navigate(`/courses/${ slugify(value, { lower: true }) }`);
                            } else {
                                setValue(suggestions[0]);
                            }
                            e.stopPropagation();
                        }
                    }
                } }
                placeholder='Search Teachers and Classes...'
            />
            <Popper open={ Boolean(suggestions) && !items.includes(value) } anchorEl={ inputRef.current }>
                <Paper
                    style={ { width: inputRef.current ? inputRef.current.clientWidth : null } }>
                    {
                        suggestions.map((suggestion, idx) => <MenuItem key={ idx } onClick={ () => setValue(suggestion) } style={ { cursor: 'pointer' } }>{
                                parse(suggestion, match(suggestion, value)).map((match, idx) => <span key={ idx } style={ {
                                    opacity: match.highlight ? 1 : 0.5,
                                    whiteSpace: 'pre'
                                } }>
                                    { match.text }
                                </span>)
                            }</MenuItem>
                        )
                    }
                </Paper>
            </Popper>
            <Button onClick={ () => {
                if (items.includes(value)) {
                    if (teachers.includes(value)) {
                        navigate(`/teachers/${ slugify(value, { lower: true }) }`);
                    } else if (courseNames.includes(value)) {
                        navigate(`/courses/${ slugify(value, { lower: true }) }`);
                    }
                }
            } }>Select</Button>
        </Grid>
    );
}

export const query = graphql`
    query {
        allMongodbStudentsReviewClasses {
            totalCount,
            nodes {
                teacher,
                courseName
            }
        }
        allMongodbStudentsReviewReviews {
            totalCount
        }
    }
`;

export default withRoot(withTheme(withProcessing(IndexPage)));
