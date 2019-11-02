import React from 'react'
import { Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { Helmet } from 'react-helmet';
import Mermaid from '../components/Mermaid';

import styles from '../styles/styles';
import { prefetchPathname, navigate } from 'gatsby';
import slugify from 'slugify';

const alpha = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
const diagrams = {
    'Computer Science': {
        'Computer Programming': [],
        'AP Principles of Computer Science': [],
        'AP Computer Science': ['Computer Programming', 'AP Principles of Computer Science']
    }
};

const CoursesPage = ({ classes }) => {
    return (
        <>
            <Helmet>
                <title>Courses</title>
                <meta name='description' content={ `See all Courses offered at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teachers'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 }>
                    {
                        Object.keys(diagrams).map(diagram => <Grid item xs={ 12 } sm={ 6 }>
                            <Typography variant='h6' className={ classes.control } style={ { textAlign: 'center' } }>{ diagram }</Typography>
                            <Mermaid
                                onClick={ Object.keys(diagrams[diagram]).reduce((acc, cur, idx) => {
                                    acc[alpha.charAt(idx)] = () => navigate(`/courses/${ slugify(cur, { lower: true }) }`);
                                    return acc;
                                }, {}) }
                                chart={
                                    ['graph LR;'].concat(Object.keys(diagrams[diagram]).reduce((acc, cur, idx) =>
                                            acc.concat(diagrams[diagram][cur].map(course => `${ alpha.charAt(Object.keys(diagrams[diagram]).indexOf(course)) }[${ course }] --> ${ alpha.charAt(idx) }[${ cur }];`)),
                                        [])).join('\n')
                                }
                            />
                        </Grid>)
                    }
                </Grid>
            </div>
        </>
    );
}

export default withStyles(styles)(CoursesPage);
