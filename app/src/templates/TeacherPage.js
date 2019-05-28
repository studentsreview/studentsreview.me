import React, { useState } from 'react';
import Layout from '../components/layout';
import {
    Button,
    Chip,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles
} from '@material-ui/core'
import { Helmet } from 'react-helmet';
import StarRatings from 'react-star-ratings';
import withProcessing from '../components/WithProcessing';
import ReviewForm from '../components/ReviewForm';
import ReviewDisplay from '../components/ReviewDisplay';
import DepartmentChip from '../components/DepartmentChip';
import Modal from '../components/Modal';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles  from '../styles/styles';

const TeacherPage = ({ pageContext, classes, location, courses, blocks, departments, semesters, rating, reviews }) => {
    const { name } = pageContext;

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(node => node.Semester === semester);

    const [modalExposed, setModalExposed] = useState(false);

    return <Layout direction='row' justify='space-between' alignItems='baseline' gridStyle={ {
        minHeight: '70%'
    } }>
        <Helmet>
            <title>{ name }</title>
            <meta name='description' content={ `See students' reviews of ${ name }, a teacher at Lowell High School.` }/>
            <meta name='keywords' content={ departments.concat(['Education', 'Lowell High School', 'Teacher']).join(',') }/>
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
                    <StarRatings
                        rating={ isNaN(rating) ? 0 : rating }
                        starRatedColor='gold'
                        starHoverColor='gold'
                        numberOfStars={ 5 }
                        starDimension={ 25 }
                        starSpacing={ 2.5 }
                    />
                </div>
                <Chip
                    label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? /(Spring|Fall)(\d{4})/.exec(semesters[semesters.length - 1]).slice(1).join(' ') : 'Pre-Fall 2014' } - ${ /(Spring|Fall)(\d{4})/.exec(semesters[0]).slice(1).join(' ') }` }
                />
                {
                    departments.map((department, idx) => <DepartmentChip
                        key={ idx }
                        department={ department }
                    />)
                }
                <div style={ {
                    marginTop: 5
                } }>
                    <Button variant='contained' color='primary' onClick={ () => setModalExposed(true) }>Write a Review</Button>
                    <Modal shown={ modalExposed }>
                        <Paper className={ classes.card }>
                            <span onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }>✕</span>
                            <ReviewForm teacher={ name } onSubmit={ () => setModalExposed(false) }/>
                        </Paper>
                    </Modal>
                </div>
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
                                                semesterCourses
                                                    .filter(node => node.Block === block)
                                                    .map((node, idx) =>
                                                        <Chip
                                                            key={ idx }
                                                            style={ node.Course_Name.length > 25 ? {
                                                                fontSize: '1vw'
                                                            } : null }
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
            </div>
        </Grid>
        <Grid>
            <ReviewDisplay reviews={ reviews }/>
        </Grid>
    </Layout>;
}

export default withProcessing()(withStyles(styles)(TeacherPage));

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
