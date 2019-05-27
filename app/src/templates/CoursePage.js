import React, { useState } from 'react';
import Layout from '../components/layout';
import {
    Paper,
    Grid,
    Select,
    MenuItem,
    Chip,
    Table,
    TableBody,
    TableRow,
    TableCell,
    withStyles
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import withProcessing from '../components/WithProcessing';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles from '../styles/styles';

const TeacherPage = ({ pageContext, classes, location, courses, blocks, semesters }) => {
    const { name } = pageContext;

    const codes = Array.from(new Set(courses.map(node => node.Course_Code)));

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(node => node.Semester === semester);

    return <Layout direction='row' justify='space-between' alignItems='baseline' gridStyle={ {
        minHeight: '70%'
    } }>
        <Helmet>
            <title>{ name }</title>
        </Helmet>
        <Paper className={ classes.card }>
            <h3 style={ {
                display: 'inline',
                marginRight: 10
            } }>{ name }</h3>
            <Chip
                style={ {
                    background: {
                        Science: 'lightgreen',
                        Math: 'lightblue',
                        'Computer Science': 'orange',
                        English: '#e0e0e0',
                        'Physical Education': 'pink',
                        JROTC: '#b5651d',
                        'Visual Performing Arts': 'beige',
                        'Social Science': 'gold',
                        'Foreign Language': '#e6e6fa'
                    }[courses[0].Department]
                } }
                label={ courses[0].Department }
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
                            marginTop: 10
                        } }
                        key={ idx }
                        label={ code }
                    />)
            }
        </Paper>
        <div className={ classes.card }>
            <Grid container direction='column' justify='center'>
                <Select value={ semester }
                        renderValue={ val => <MenuItem>{ /(Spring|Fall)(\d{4})/.exec(val).slice(1).join(' ') }</MenuItem> }
                        onChange={ (_, child) => setSemester(child.props.value) }
                >
                    <MenuItem value={ semester }>{ /(Spring|Fall)(\d{4})/.exec(semester).slice(1).join(' ') }</MenuItem>
                    {
                        semesters
                            .slice(0, semesters.indexOf(semester))
                            .concat(semesters.slice(semesters.indexOf(semester) + 1))
                            .map((semester, idx) => <MenuItem
                                value={ semester }
                                key={ idx }
                            >
                                { /(Spring|Fall)(\d{4})/.exec(semester).slice(1).join(' ') }
                            </MenuItem>)
                    }
                </Select>
                <Table>
                    <TableBody>
                        {
                            blocks
                                .filter(block => ['1', '2', '3', '4', '5', '6', '7', '8'].includes(block) || semesterCourses.some(node => node.Block === block))
                                .map((block, idx) => <TableRow key={ idx }>
                                    <TableCell>Period { block }</TableCell>
                                    <TableCell>
                                        {
                                            Array.from(new Set(
                                                semesterCourses
                                                    .filter(node => node.Block === block)
                                                    .map(node => node.Teacher)
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
                                    </TableCell>
                            </TableRow>)
                        }
                    </TableBody>
                </Table>
            </Grid>
        </div>
    </Layout>;
}

export default withProcessing()(withStyles(styles)(TeacherPage));

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Course_Name: {
                eq: $name
            }
        }) {
            nodes {
                Course_Name,
                Course_Code,
                Department,
                Semester,
                Teacher,
                Block
            }
        }
    }
`;
