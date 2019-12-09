import React, { useEffect, useRef, useState } from 'react';
import { AppBar, MenuItem, MenuList, Paper, Popper, TextField, Toolbar, Typography } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/styles';
import { Link, graphql, useStaticQuery, prefetchPathname } from 'gatsby';
import Image from 'gatsby-image';
import { withApollo } from 'react-apollo';

import slugify from 'slugify';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { navigate } from '@reach/router';
import { removeDupes, useWidth } from '../utils';
import { isWidthUp } from '@material-ui/core/withWidth';
import { FIND_REVIEWS } from '../graphql';

import '../styles/layout.css';

const styles = createStyles({
    label: {
        color: 'rgba(0, 0, 0, 0.375)'
    },
    textField: {
        '& .MuiFilledInput-root': {
            '& input': {
                backgroundColor: 'white',
                borderRadius: '5px'
            }
        }
    },
    shrink: {
        color: 'rgba(0, 0, 0, 0.75) !important'
    }
});

const AppHeader = ({ classes, client }) => {
    const data = useStaticQuery(graphql`
            query {
                file(relativePath: { eq: "transparent_logo.png" }) {
                    childImageSharp {
                        fixed(width: 75, height: 75) {
                            ...GatsbyImageSharpFixed
                        }
                    }
                }
                srapi {
                    findManyCourse {
                        name
                    }
                    findManyTeacher {
                        name
                    }
                }
            }
    `);

    const width = useWidth();

    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    const teacherNames = data.srapi.findManyTeacher.map(teacher => teacher.name);
    const courseNames = removeDupes(data.srapi.findManyCourse.map(course => course.name));

    if (teacherNames.indexOf('Undetermined') !== -1) {
        teacherNames.splice(teacherNames.indexOf('Undetermined'), 1);
    }

    const items = teacherNames.concat(courseNames);
    const suggestions = items.filter(item => match(item, value).length > 0).sort((a, b) => match(b, value).length - match(a, value).length).slice(0, 5);

    const navigateToSuggestion = suggestion => {
        if (teacherNames.includes(suggestion)) {
            navigate(`/teachers/${ slugify(suggestion, { lower: true }) }`);
        } else if (courseNames.includes(suggestion)) {
            navigate(`/courses/${ slugify(suggestion, { lower: true }) }`);
        }
        setValue('');
    }

    const keyDownHandler = e => {
        if (e.key === 'Enter') {
            navigateToSuggestion(suggestions[0]);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => window.removeEventListener('keydown', keyDownHandler);
    });

    useEffect(() => {
        for (let suggestion of suggestions) {
            if (teacherNames.includes(suggestion)) {
                prefetchPathname(`/teachers/${ slugify(suggestion, { lower: true }) }`);
                client.query({
                    query: FIND_REVIEWS,
                    variables: {
                        name: suggestion
                    }
                });
            } else if (courseNames.includes(suggestion)) {
                prefetchPathname(`/courses/${ slugify(suggestion, { lower: true }) }`);
            }
        }
    }, [suggestions]);

    return (
        <AppBar position='static'>
            <Toolbar>
                <Link to='/'><Image fixed={ data.file.childImageSharp.fixed }/></Link>
                { isWidthUp('md', width) && <>
                    <div style={ { flexGrow: 1 } }/>
                    <Link to='/teachers'><Typography variant='h6'>teachers</Typography></Link>
                    <div style={ { flexGrow: 1 } }/>
                    <Link to='/courses'><Typography variant='h6'>courses</Typography></Link>
                </> }
                <div style={ { flexGrow: 25 } }/>
                <TextField
                    style={ { width: 300 } }
                    variant='filled'
                    className={ classes.textField }
                    InputLabelProps={ { classes: { root: classes.label, shrink: classes.shrink } } }
                    label='Search'
                    inputRef={ inputRef }
                    value={ value }
                    onChange={ e => setValue(e.target.value) }
                />
                <Popper open={ Boolean(suggestions) } anchorEl={ inputRef.current }>
                    <MenuList style={ { padding: 0, width: inputRef.current && inputRef.current.clientWidth } } component={ Paper }>
                        {
                            suggestions.map((suggestion, idx) => <MenuItem
                                    key={ idx }
                                    onClick={ () => navigateToSuggestion(suggestion) }
                                    style={ { cursor: 'pointer' } }
                                >{
                                    parse(suggestion, match(suggestion, value)).map((match, idx) => <span key={ idx } style={ {
                                        opacity: match.highlight ? 1 : 0.5,
                                        whiteSpace: 'pre'
                                    } }>{ match.text }</span>)
                                }</MenuItem>
                            )
                        }
                    </MenuList>
                </Popper>
            </Toolbar>
        </AppBar>
    );
};

export default withStyles(styles)(withApollo(AppHeader));
