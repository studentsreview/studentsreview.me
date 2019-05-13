import React, { useRef, useState } from 'react'
import Layout from '../components/layout';
import { Button, MenuItem, Paper, Popper, TextField } from '@material-ui/core';

import { graphql } from 'gatsby';
import slugify from 'slugify';
import isEqual from 'lodash/isEqual';
import match from 'autosuggest-highlight/match';
import { navigate } from '@reach/router';
import parse from 'autosuggest-highlight/parse';

export default ({ data }) => {
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    const teachers = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Teacher)));
    const courses = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Course_Name)));

    const items = teachers.concat(courses);

    const suggestions = items.filter(item => !isEqual(match(item, value), [])).sort((a, b) => match(b, value).length - match(a, value).length).slice(0, 5);
    return (
        <Layout gridStyle={ {
            height: '70%'
        } }>
            <TextField
                style={ {
                    width: '70vw',
                    maxWidth: 760
                } }
                inputRef={ inputRef }
                value={ value }
                onChange={ e => setValue(e.target.value) }
                inputProps={ {
                    onKeyDown: e => {
                        if (e.keyCode === 13) {
                            if (teachers.includes(value)) {
                                navigate(`teachers/${ slugify(value, { lower: true }) }`);
                            } else if (courses.includes(value)) {
                                navigate(`courses/${ slugify(value, { lower: true }) }`);
                            } else {
                                setValue(suggestions[0]);
                            }
                        }
                    }
                } }
                placeholder='Search Teachers and Classes...'
            />
            <Popper open={ Boolean(suggestions) && !items.includes(value) } anchorEl={ inputRef.current }>
                <Paper
                    style={ { width: inputRef.current ? inputRef.current.clientWidth : null } }>
                    {
                        suggestions.map((suggestion, idx) => <MenuItem key={ idx } onClick={ () => {
                                setValue(suggestion);
                            } } style={ { cursor: 'pointer' } }>{
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
                        navigate(`teachers/${ slugify(value, { lower: true }) }`);
                    } else if (courses.includes(value)) {
                        navigate(`courses/${ slugify(value, { lower: true }) }`);
                    }
                }
            } }>Select</Button>
        </Layout>);
}

export const query = graphql`
    query {
        allMongodbStudentsReviewClasses {
            nodes {
                Teacher,
                Course_Name
            }
        }
    }
`;
