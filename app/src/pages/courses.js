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
    const diagramData = data.srapi.findManyCourse.reduce((acc, cur) => {
        if (!(cur.department in acc)) {
            acc[cur.department] = {};
        }
        acc[cur.department][cur.name] = cur.prerequisites;
        return acc;
    }, {});

    const diagrams = {
        Math: '* Incoming freshmen can take the MVT to skip Algebra 1',
        Science: `* Juniors and Seniors can also take electives not part of the 3 "main" sciences (${ data.srapi.findManyCourse.filter(course => course.department === 'Science' && course.prerequisites.length === 0 && course.name !== 'Biology').map(course => course.name).join(', ') })`,
        English: `* Juniors and Seniors not taking AP Englishes or Critical Writing (1 semester required for non-AP Juniors) take English electives (${ data.srapi.findManyCourse.filter(course => course.department === 'English' && course.prerequisites.length === 0 && !(['English 1', 'English Support', 'Communication and Writing'].includes(course.name))).map(course => course.name).join(', ') })`,
        'Computer Science': '* Students can skip AP Computer Science prerequisites if they have previous experience'
    }

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
                        Object.keys(diagrams).map((diagram, idx) => <Grid key={ idx } item xs={ 12 } sm={ 6 }>
                            <Typography variant='h6' className={ classes.control } style={ { textAlign: 'center' } }>{ diagram }</Typography>
                            <Mermaid
                                onClick={ Object.keys(diagramData[diagram]).reduce((acc, cur, idx) => {
                                    acc[slugify(diagram).toUpperCase().concat(alphabet.charAt(idx))] = () => navigate(`/courses/${ slugify(cur, { lower: true }) }`);
                                    return acc;
                                }, {}) }
                                chart={
                                    ['graph TD;'].concat(Object.keys(diagramData[diagram]).reduce((acc, cur, idx) =>
                                            acc.concat(diagramData[diagram][cur].map(course => `${ slugify(diagram).toUpperCase().concat(alphabet.charAt(Object.keys(diagramData[diagram]).indexOf(course))) }[${ course }] --> ${ slugify(diagram).toUpperCase().concat(alphabet.charAt(idx)) }[${ cur }];`)),
                                        [])).join('\n')
                                }
                            />
                            <Typography variant='caption'>{ diagrams[diagram] }</Typography>
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
