import React from 'react'
import { Typography, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

import { Helmet } from 'react-helmet';
import Mermaid from '../components/Mermaid';

import { graphql, prefetchPathname, navigate } from 'gatsby';
import slugify from 'slugify';

import styles from '../styles/styles';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();

const CoursesPage = ({ classes, data }) => {
    const diagrams = data.srapi.findManyCourse.reduce((acc, cur) => {
        if (!(cur.department in acc)) {
            acc[cur.department] = {};
        }
        acc[cur.department][cur.name] = cur.prerequisites;
        return acc;
    }, {});

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
                                    acc[alphabet.charAt(idx)] = () => navigate(`/courses/${ slugify(cur, { lower: true }) }`);
                                    return acc;
                                }, {}) }
                                chart={
                                    ['graph LR;'].concat(Object.keys(diagrams[diagram]).reduce((acc, cur, idx) =>
                                            acc.concat(diagrams[diagram][cur].map(course => `${ alphabet.charAt(Object.keys(diagrams[diagram]).indexOf(course)) }[${ course }] --> ${ alphabet.charAt(idx) }[${ cur }];`)),
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

export const query = graphql`
    query {
        srapi {
            findManyCourse(
                filter: {
                    _operators: {
                        semesters: {
                            in: "Fall2019"
                        }
                    }
                }
            ) {
                name
                prerequisites
                department
            }
        }
    }
`;

export default withStyles(styles)(CoursesPage);
