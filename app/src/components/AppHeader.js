import React, { useEffect, useRef, useState } from 'react';
import { AppBar, MenuItem, MenuList, Paper, Popper, TextField, Toolbar } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/styles';
import { Link, graphql, useStaticQuery, prefetchPathname } from 'gatsby';
import Img from 'gatsby-image';

import slugify from 'slugify';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { navigate } from '@reach/router';
import { removeDupes } from '../utils';

import '../styles/layout.css';

const styles = createStyles({
    label: {
        color: 'rgba(0, 0, 0, 0.375)'
    },
    textField: {
        '& .MuiFilledInput-root': {
            '& input': {
                backgroundColor: 'azure'
            },
            '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.75) !important'
            }
        }
    },
    shrink: {
        color: 'rgba(0, 0, 0, 0.75) !important'
    }
});

const AppHeader = ({ classes }) => {
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

    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    const teacherNames = data.srapi.findManyTeacher.map(teacher => teacher.name);
    const courseNames = removeDupes(data.srapi.findManyCourse.map(course => course.name));

    if (teacherNames.indexOf('Undetermined') !== -1) {
        teacherNames.splice(teacherNames.indexOf('Undetermined'), 1);
    }

    const items = teacherNames.concat(courseNames);
    const suggestions = items.filter(item => match(item, value).length > 0).sort((a, b) => match(b, value).length - match(a, value).length).slice(0, 5);

    const keyDownHandler = e => {
        if (e.key === 'Enter') {
            if (teacherNames.includes(suggestions[0])) {
                navigate(`/teachers/${ slugify(suggestions[0], { lower: true }) }`);
            } else if (courseNames.includes(suggestions[0])) {
                navigate(`/courses/${ slugify(suggestions[0], { lower: true }) }`);
            }
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
            } else if (courseNames.includes(suggestion)) {
                prefetchPathname(`/courses/${ slugify(suggestion, { lower: true }) }`);
            }
        }
    }, [suggestions]);

    return (
        <AppBar position='static'>
            <Toolbar>
                <Link to='/'><Img fixed={ data.file.childImageSharp.fixed }/></Link>
                <div style={ { flexGrow: 1 } }/>
                <TextField
                    style={ { width: 300 } }
                    variant='filled'
                    className={ classes.textField }
                    InputLabelProps={ { classes: { root: classes.label, shrink: classes.shrink } } }
                    label='Quick Search'
                    inputRef={ inputRef }
                    value={ value }
                    onChange={ e => setValue(e.target.value) }
                    placeholder='Search Teachers and Courses...'
                />
                <Popper open={ Boolean(suggestions) } anchorEl={ inputRef.current }>
                    <MenuList style={ { padding: 0, width: inputRef.current && inputRef.current.clientWidth } } component={ Paper }>
                        {
                            suggestions.map((suggestion, idx) => <MenuItem
                                    key={ idx }
                                    onClick={ () => {
                                        if (teacherNames.includes(suggestion)) {
                                            navigate(`/teachers/${ slugify(suggestion, { lower: true }) }`);
                                        } else if (courseNames.includes(suggestion)) {
                                            navigate(`/courses/${ slugify(suggestion, { lower: true }) }`);
                                        }
                                    } }
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

export default withStyles(styles)(AppHeader);
