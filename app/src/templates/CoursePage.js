import React, { useState } from 'react';
import { Paper, Grid, Chip, Typography, withStyles } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import withProcessing from '../components/hoc/withProcessing';
import DepartmentChip from '../components/DepartmentChip';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles from '../styles/styles';

const TeacherPage = ({ pageContext, classes, codes, location, courses, blocks, semesters, theme }) => {
    const { name } = pageContext;

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(node => node.semester === semester);

    return (
        <Grid container direction='row' justify='space-between' alignItems='baseline' style={ {
            minHeight: '70%'
        } }>
            <Helmet>
                <title>{ name }</title>
                <meta name='description' content={ `See which teachers teach ${ name } at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Course', courses[0].Department, name].join(',') }/>
            </Helmet>
            <Paper className={ classes.card }>
                <Typography variant='h6' style={ {
                    display: 'inline',
                    marginRight: theme.spacing(2)
                } }>{ name }</Typography>
                <DepartmentChip
                    department={ courses[0].department }
                />
                {
                    name.includes('Honors') ? <Chip
                        style={ {
                            background: '#6a4f6b'
                        } }
                        label='Honors'
                    /> : null
                }
                {
                    name.includes('AP') ? <Chip
                        style={ {
                            background: '#cfb53b'
                        } }
                        label='AP'
                    /> : null
                }
                <Chip
                    label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? /(Spring|Fall)(\d{4})/.exec(semesters[semesters.length - 1]).slice(1).join(' ') : 'Pre-Fall 2014' } - ${ /(Spring|Fall)(\d{4})/.exec(semesters[0]).slice(1).join(' ') }` }
                />
                <br/>
                {
                    codes
                        .filter(code => !code.endsWith('A') && !code.endsWith('B'))
                        .map((code, idx) => <Chip
                            style={ {
                                marginTop: theme.spacing(2)
                            } }
                            key={ idx }
                            label={ code }
                        />)
                }
            </Paper>
            <Grid container className={ classes.card } direction='column' justify='center'>
                <SemesterSelect
                    semesters={ semesters }
                    value={ semester }
                    onChange={ setSemester }
                />
                <ScheduleTable
                    blocks={ ['1', '2', '3', '4', '5', '6', '7', '8'].concat(Array.from(new Set(semesterCourses.map(node => node.block).filter(block => block > 8)))) }
                >
                    { ({ block }) => Array.from(new Set(
                        semesterCourses
                            .filter(node => node.block === block)
                            .map(node => node.teacher)
                    ))
                        .map((teacher, idx) =>
                            teacher === 'Undetermined' ? <Chip
                                key={ idx }
                                label={ teacher }
                            /> : <Chip
                                key={ idx }
                                label={ teacher.split(' ')[teacher.split(' ').length - 1] }
                                onClick={ () => navigate(`/teachers/${ slugify(teacher, { lower: true }) }`, {
                                    state: {
                                        semester
                                    }
                                }) }
                            />)
                    }
                </ScheduleTable>
            </Grid>
        </Grid>
    );
}

export default withTheme(withProcessing(withStyles(styles)(TeacherPage)));

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            courseName: {
                eq: $name
            }
        }) {
            nodes {
                courseName,
                courseCode,
                department,
                semester,
                teacher,
                block
            }
        }
    }
`;
