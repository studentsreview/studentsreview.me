import React, { useState, useEffect } from 'react';
import { Paper, Grid, Chip, Typography } from '@material-ui/core';
import { useTheme, withStyles } from '@material-ui/styles';
import { withApollo } from 'react-apollo';
import { Helmet } from 'react-helmet';
import DepartmentChip from '../components/DepartmentChip';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';
import CollapsibleText from '../components/CollapsibleText';

import { graphql, prefetchPathname } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { formatSemesterRange, getBlocks, removeDupes, sortSemesters, shortenTeacherName } from '../utils';
import { FIND_REVIEWS } from '../graphql';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';

import { LowellHighSchool } from '../schema';
import styles from '../styles/styles';

const CoursePage = ({ data, pageContext, classes, location, client }) => {
    const { name } = pageContext;

    const course = data.srapi.findOneCourse;
    const semesters = sortSemesters(removeDupes(data.srapi.findManyClass.map(class_ => class_.semester)));
    const codes = removeDupes(data.srapi.findManyClass.map(class_ => class_.code));

    const initialSemester = location.state && location.state.semester;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterClasses = data.srapi.findManyClass
        .filter(class_ => class_.semester === semester);

    const theme = useTheme();

    useEffect(() => {
        const shownTeachers = removeDupes(semesterClasses.map(class_ => class_.teacher));
        for (let teacher of shownTeachers) {
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
    }, [semesterClasses]);

    return (
        <>
            <Helmet>
                <title>{ name }</title>
                <meta name='description' content={ `See which teachers teach ${ name } at Lowell High School in San Francisco.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teacher', 'Course', 'San Francisco', course.department, name] }/>
                <script type='application/ld+json'>
                    { JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Course',
                        courseCode: codes.join(', '),
                        coursePrerequisites: course.prerequisites.join(', '),
                        name,
                        description: course.description ? course.description :
                            `${ name } is a${ /^[AEIOU]/.test(course.department) ? 'n' : '' } ${ course.department } class offered at Lowell High School in San Francisco.`,
                        provider: LowellHighSchool
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
                            <DepartmentChip department={ course.department }/>
                            {
                                name.includes('Honors') && <Chip
                                    style={ { background: '#6a4f6b' } }
                                    label='Honors'
                                />
                            }
                            {
                                name.includes('AP') && <Chip
                                    style={ { background: '#cfb53b' } }
                                    label='AP'
                                />
                            }
                            <Chip label={ formatSemesterRange(semesters) }/>
                            <div style={ { marginTop: theme.spacing(1) } }/>
                            { /*
                                codes
                                    .filter(code => !code.endsWith('A') && !code.endsWith('B'))
                                    .map((code, idx) => <Chip
                                        key={ idx }
                                        label={ code }
                                    />)
                                 <br/>
                            */ }
                            { course.AtoG ? <Chip label={ course.AtoG }/> : null }
                            { course.length ? <Chip label={ course.length }/> : null }
                            { course.grades ? <Chip label={ `Grade${ course.grades.includes('-') ? 's' : '' } ${ course.grades }` }/> : null }
                            <div style={ { marginTop: theme.spacing(1) } }/>
                            { course.notes ? <>
                                <div style={ { marginTop: theme.spacing(1) } }/>
                                <Typography variant='body1'>
                                    <b>Notes: </b> { course.notes }
                                </Typography>
                            </>: null }
                            { course.description ? <>
                                <div style={ { marginTop: theme.spacing(1) } }/>
                                <b>Description: </b>
                                <CollapsibleText
                                    text={ course.description } truncateLength={ 100 }
                                    typographyProps={ { style: { whiteSpace: 'pre-wrap' } } }
                                />
                            </>: null }
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
                                    label: e.target.value
                                });
                                setSemester(semester);
                            } }
                        />
                        <ScheduleTable
                            blocks={ getBlocks().concat(removeDupes(semesterClasses.map(class_ => class_.block).filter(block => block > 8))) }
                        >
                            { ({ block }) => semesterClasses
                                .filter(class_ => class_.block === block)
                                .map((class_, idx) =>
                                    class_.teacher === 'Undetermined' ? <Chip
                                        key={ idx }
                                        label={ class_.teacher }
                                    /> : <Chip
                                        key={ idx }
                                        label={
                                            `${ shortenTeacherName(class_.teacher) }${ class_.section ? ` (${ class_.section })` : '' }`
                                        }
                                        onClick={ () => navigate(`/teachers/${ slugify(class_.teacher, { lower: true }) }`, {
                                            state: { semester: semester === semesters[0] ? null : semester }
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
                section
            }
            findOneCourse(filter: {
                name: $name
            }) {
                department
                prerequisites
                notes
                grades
                length
                AtoG
                description
            }
        }
    }
`;
