import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import Course from '../components/arena/Course';

import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/styles';
import { removeDupes } from '../utils';

import styles from '../styles/styles';

const ArenaPage = ({ classes, data }) => {
    const departments = removeDupes(data.srapi.findManyCourse.map(course => course.department));

    return (
        <>
            <div className={ classes.root }>
                <Grid container spacing={ 3 } direction='column' alignItems='center'>
                    <Grid item sm={ 6 } xs={ 12 }>
                        <Paper className={ classes.control }>
                            <Course
                                id={ 0 }
                                courses={ data.srapi.findManyCourse }
                                classes={ data.srapi.findManyClass }
                                departments={ departments }
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export const query = graphql`
    query {
        srapi {
            findManyCourse(
                filter: {
                    _operators: {
                        semesters: {
                            in: "Spring2020"
                        }
                    }
                }
            ) {
                name
                department
                sectioned
            }
            findManyClass(
                filter: {
                    semester: "Spring2020"
                }
            ) {
                name
                teacher
                block
                section
            }
        }
    }
`;

export default withStyles(styles)(ArenaPage);
