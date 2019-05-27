import React, { useState, useRef } from 'react';
import Layout from '../components/layout';
import {
    Button,
    Chip,
    Divider,
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
} from '@material-ui/core'
import { Helmet } from 'react-helmet';
import withProcessing from '../components/WithProcessing';
import ReviewForm from '../components/ReviewForm';
import DepartmentChip from '../components/DepartmentChip';

import { isWidthDown } from '@material-ui/core/withWidth';
import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { isMobile } from 'react-device-detect';

import styles  from '../styles/styles';

const TeacherPage = ({ pageContext, classes, location, width, courses, blocks, departments, semesters, reviews }) => {
    const { name } = pageContext;

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(node => node.Semester === semester);

    const [pageNumber, setPageNumber] = useState(0);
    const reviewsRef = useRef(null);

    return <Layout direction='row' justify='space-between' alignItems='baseline' gridStyle={ {
        minHeight: '70%'
    } }>
        <Helmet>
            <title>{ name }</title>
        </Helmet>
        <Grid>
            <Paper className={ classes.card }>
                <h3 style={ {
                    display: 'inline',
                    marginRight: 10
                } }>{ name }</h3>
                <Chip
                    label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? /(Spring|Fall)(\d{4})/.exec(semesters[semesters.length - 1]).slice(1).join(' ') : 'Pre-Fall 2014' } - ${ /(Spring|Fall)(\d{4})/.exec(semesters[0]).slice(1).join(' ') }` }
                />
                <br/>
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
                !isMobile ? <div className={ classes.card }>
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
                                                                style={ node.Course_Name.length > 25 && isWidthDown('xs', width) ? {
                                                                    fontSize: '1.75vw'
                                                                } : null }
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
            <h3 ref={ reviewsRef } className={ classes.card } style={ { textAlign: 'center' } }>Reviews</h3>
            {
                reviews.length > 0 ? reviews.slice(pageNumber * 5, (pageNumber + 1) * 5).map((review, idx) => <p key={ idx } className={ classes.card } style={ {
                    wordWrap: 'break-word'
                } }>
                    {
                        review.replace(/Submitted by a student$/, '')
                    }
                </p>).reduce((acc, cur) => [acc, <Divider key={ cur.length + 4 }/>, cur]) : <p className={ classes.card } style={ { textAlign: 'center' } }>No Reviews Available.</p>
            }
            <Grid container className={ classes.card } direction='row' justify='space-between'>
                <Button disabled={ pageNumber === 0 } onClick={ () => {
                    setPageNumber(pageNumber - 1);
                    reviewsRef.current.scrollIntoView();
                } }>Previous Page</Button>
                <Button disabled={ (pageNumber + 1) * 5 >= reviews.length } onClick={ () => {
                    setPageNumber(pageNumber + 1);
                    reviewsRef.current.scrollIntoView();
                } }>Next Page</Button>
            </Grid>
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
                Text
            }
        }
    }
`;
