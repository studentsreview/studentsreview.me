import React, { useState } from 'react';
import { Paper, Grid, Chip, Typography, withStyles } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import DepartmentChip from '../components/DepartmentChip';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { splitSemester, getCurrentSemester, getBlocks, removeDupes } from '../utils';

import styles from '../styles/styles';

const TeacherPage = ({ data, pageContext, classes, location, theme }) => {
    const { name } = pageContext;

    const courses = data.srapi.findManyCourse;
    const semesters = removeDupes(data.srapi.findManyCourse.map(course => course.semester));
    const codes = removeDupes(data.srapi.findManyCourse.map(course => course.code))

    const initialSemester = location.state && location.state.semester ? location.state.semester : getCurrentSemester();
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(course => course.semester === semester);

    return (
        <div className={ classes.root }>
            <Grid container spacing={ 3 }>
                <Helmet>
                    <title>{ name }</title>
                    <meta name='description' content={ `See which teachers teach ${ name } at Lowell High School.` }/>
                    <meta name='keywords' content={ ['Education', 'Lowell High School', 'Course', courses[0].Department, name].join(',') }/>
                </Helmet>
                <Grid item xs={ 12 } sm={ 6 }>
                    <Paper className={ classes.control }>
                        <Typography variant='h6' style={ {
                            display: 'inline',
                            marginRight: theme.spacing(2)
                        } }>{ name }</Typography>
                        <DepartmentChip
                            department={ data.srapi.findOneCourse.department }
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
                            label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? splitSemester(semesters[semesters.length - 1]) : 'Pre-Fall 2014' } - ${ splitSemester(semesters[0]) }` }
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
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <SemesterSelect
                        semesters={ semesters }
                        value={ semester }
                        onChange={ setSemester }
                    />
                    <ScheduleTable
                        blocks={ getBlocks().concat(removeDupes(semesterCourses.map(node => node.block).filter(block => block > 8))) }
                    >
                        { ({ block }) => removeDupes(
                            semesterCourses
                                .filter(course => course.block === block)
                                .map(course => course.teacher)
                        )
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
        </div>
    );
}

export default withStyles(styles)(withTheme(TeacherPage));

export const query = graphql`
    query($name: String!) {
        srapi {
            findManyCourse(filter: {
                name: $name
            }) {
                code
                semester
                teacher
                block
            }
            findOneCourse(filter: {
                name: $name
            }) {
                department
            }
        }
    }
`;
