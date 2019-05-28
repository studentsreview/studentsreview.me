import React, { useState } from 'react';
import Layout from '../components/layout';
import {
    Chip,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles,
    withWidth
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import withProcessing from '../components/WithProcessing';
import ReviewForm from '../components/ReviewForm';
import ReviewDisplay from '../components/ReviewDisplay';
import DepartmentChip from '../components/DepartmentChip';

import { isWidthUp } from '@material-ui/core/withWidth';
import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles  from '../styles/styles';

const TeacherPage = ({ pageContext, classes, location, width, courses, blocks, departments, semesters, rating, reviews }) => {
    const { name } = pageContext;

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
        <Grid>
            <Paper className={ classes.card }>
                <div style={ {
                    marginBottom: 5
                } }>
                    <h3 style={ {
                        display: 'inline',
                        marginRight: 10,
                    } }>{ name }</h3>
                    <Chip
                        label={ `${ rating.toFixed(1) } out of 5.0` }
                    />
                    <Chip
                        label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? /(Spring|Fall)(\d{4})/.exec(semesters[semesters.length - 1]).slice(1).join(' ') : 'Pre-Fall 2014' } - ${ /(Spring|Fall)(\d{4})/.exec(semesters[0]).slice(1).join(' ') }` }
                    />
                </div>
                {
                    departments.map((department, idx) => <DepartmentChip
                        key={ idx }
                        department={ department }
                    />)
                }
                <ReviewForm
                    teacher={ name }
                />
            </Paper>
            {
                isWidthUp('sm', width) ? <div className={ classes.card }>
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
                                                    semesterCourses
                                                        .filter(node => node.Block === block)
                                                        .map((node, idx) =>
                                                            <Chip
                                                                key={ idx }
                                                                label={ node.Course_Name }
                                                                onClick={ () => navigate(`/courses/${ slugify(node.Course_Name, { lower: true }) }`, {
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
                </div> : null
            }
        </Grid>
        <Grid>
            <ReviewDisplay reviews={ reviews }/>
        </Grid>
    </Layout>;
}

export default withProcessing()(withWidth()(withStyles(styles)(TeacherPage)));

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Teacher: {
                eq: $name
            }
        }) {
            nodes {
                Department,
                Semester,
                Course_Name,
                Block,
                Room
            }
        }
        allMongodbStudentsReviewReviews(filter: {
            Teacher: {
                eq: $name
            }
        }) {
            nodes {
                Text,
                Timestamp,
                Rating,
                version
            }
        }
    }
`;
