import React, { useState } from 'react';
import { Button, Chip, Grid, Paper, withStyles, withWidth } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import StarRatings from 'react-star-ratings';
import IosClose from 'react-ionicons/lib/IosClose';
import withProcessing from '../components/withProcessing';
import ReviewForm from '../components/ReviewForm';
import ReviewDisplay from '../components/ReviewDisplay';
import DepartmentChip from '../components/DepartmentChip';
import Modal from '../components/Modal';
import SemesterSelect from '../components/SemesterSelect';

import { isWidthUp } from '@material-ui/core/withWidth';
import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles from '../styles/styles';
import ScheduleTable from '../components/ScheduleTable'

const TeacherPage = ({ pageContext, classes, location, courses, blocks, departments, semesters, rating, reviews, width }) => {
    const { name } = pageContext;

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(node => node.semester === semester);

    const [modalExposed, setModalExposed] = useState(false);

    return <Grid container direction='row' justify='space-between' alignItems='baseline' style={ {
        minHeight: '70%'
    } }>
        <Helmet>
            <title>{ name }</title>
            <meta name='description' content={ `See students' reviews of ${ name }, a teacher at Lowell High School.` }/>
            <meta name='keywords' content={ departments.concat(['Education', 'Lowell High School', 'Teacher', name]).join(',') }/>
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
                    <Button
                        variant='contained'
                        color='primary'
                        disabled={ !semesters.includes(`${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`) }
                        onClick={ () => setModalExposed(true) }
                    >Write a Review</Button>
                    <Modal shown={ modalExposed }>
                        <Paper className={ classes.card }>
                            <IosClose onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }/>
                            <ReviewForm teacher={ name } onClose={ () => setModalExposed(false) }/>
                        </Paper>
                    </Modal>
                </div>
            </Paper>
            <div className={ classes.card }>
                <Grid container direction='column' justify='center'>
                    <SemesterSelect
                        semesters={ semesters }
                        value={ semester }
                        onChange={ setSemester }
                    />
                    <ScheduleTable
                        blocks={ ['1', '2', '3', '4', '5', '6', '7', '8'].concat(Array.from(new Set(semesterCourses.map(node => node.block).filter(block => block > 8)))) }
                        component={ ({ block }) => semesterCourses
                            .filter(node => node.block === block)
                            .map((node, idx) =>
                                <Chip
                                    key={ idx }
                                    style={ node.courseName.length > 25 ? {
                                        fontSize: isWidthUp('sm', width) ? '0.9vw' : '1.8vw'
                                    } : null }
                                    label={ node.courseName }
                                    onClick={ () => navigate(`/courses/${ slugify(node.courseName, { lower: true }) }`, {
                                        state: {
                                            semester
                                        }
                                    }) }
                                />)
                        }
                    />
                </Grid>
            </div>
        </Grid>
        <Grid>
            <ReviewDisplay reviews={ reviews }/>
        </Grid>
    </Grid>;
}

export default withWidth()(withProcessing()(withStyles(styles)(TeacherPage)));

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            teacher: {
                eq: $name
            }
        }) {
            nodes {
                department,
                semester,
                courseName,
                block,
                room
            }
        }
        allMongodbStudentsReviewReviews(filter: {
            teacher: {
                eq: $name
            }
        }) {
            nodes {
                text,
                timestamp,
                rating,
                version
            }
        }
    }
`;
