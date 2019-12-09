import React, { useState, useEffect } from 'react';
import { Paper, Grid, Chip, Typography } from '@material-ui/core';
import { useTheme, withStyles } from '@material-ui/styles';
import { withApollo } from 'react-apollo';
import { Helmet } from 'react-helmet';
import DepartmentChip from '../components/DepartmentChip';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';

import { graphql, prefetchPathname } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { formatSemesterRange, getBlocks, removeDupes, semesterValue, sortSemesters } from '../utils'
import { FIND_REVIEWS } from '../graphql';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';

import styles from '../styles/styles';

const CoursePage = ({ data, pageContext, classes, location, client }) => {
    const { name } = pageContext;

    const courses = data.srapi.findManyClass;
    const department = data.srapi.findOneCourse.department;
    const prerequisites = data.srapi.findOneCourse.prerequisites
    const semesters = sortSemesters(removeDupes(data.srapi.findManyClass.map(course => course.semester)));
    const codes = removeDupes(data.srapi.findManyClass.map(course => course.code))

    const initialSemester = location.state && location.state.semester;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(course => course.semester === semester);

    const theme = useTheme();

    useEffect(() => {
        const teachers = removeDupes(semesterCourses.map(course => course.teacher));
        for (let teacher of teachers) {
            if (teacher !== 'Undetermined') {
                prefetchPathname(`/teachers/${ slugify(teacher, { lower: true }) }`);
                client.query({
                    query: FIND_REVIEWS,
                    variables: {
                        name: teacher
                    }
                });
            }
        }
    }, [semesterCourses]);

    return (
        <>
            <Helmet>
                <title>{ name }</title>
                <meta name='description' content={ `See which teachers teach ${ name } at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Course', department, name] }/>
                <script type="application/ld+json">
                    { JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Course',
                        courseCode: codes.join(', '),
                        coursePrerequisites: prerequisites.join(', '),
                        name,
                        description: `${ name } is a${ /^[AEIOU]/.test(department) ? 'n' : '' } ${ department } class offered at Lowell High School.`,
                        provider: {
                            '@type': 'Organization',
                            name: 'Lowell High School'
                        }
                    }) }
                </script>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 }>
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
                                name.includes('Honors') && <Chip
                                    style={ {
                                        background: '#6a4f6b'
                                    } }
                                    label='Honors'
                                />
                            }
                            {
                                name.includes('AP') && <Chip
                                    style={ {
                                        background: '#cfb53b'
                                    } }
                                    label='AP'
                                />
                            }
                            <Chip
                                label={ formatSemesterRange(semesters) }
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
                            onChange={ semester => {
                                trackCustomEvent({
                                    category: 'Semester Select',
                                    action: 'Select',
                                    label: 'Course Page',
                                    value: semesterValue(semester)
                                });
                                setSemester(semester);
                            } }
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
                                        label={ teacher.split(' ').slice(1).join(' ') }
                                        onClick={ () => navigate(`/teachers/${ slugify(teacher, { lower: true }) }`, {
                                            state: {
                                                semester: semester === semesters[0] ? null : semester
                                            }
                                        }) }
                                    />)
                            }
                        </ScheduleTable>
                    </Grid>
                </Grid>
            </div>
        </>
    );
}

export default withStyles(styles)(withApollo(CoursePage));

export const query = graphql`
    query($name: String!) {
        srapi {
            findManyClass(filter: {
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
                prerequisites
            }
        }
    }
`;
