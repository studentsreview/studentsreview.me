import React, { useState } from 'react';
import { Button, Chip, Grid, Paper, Typography, withStyles } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import StarRatings from 'react-star-ratings';
import IosClose from 'react-ionicons/lib/IosClose';
import withProcessing from '../components/hoc/withProcessing';
import ReviewForm from '../components/ReviewForm';
import DepartmentChip from '../components/DepartmentChip';
import Modal from '../components/Modal';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import gql from 'graphql-tag';

import styles from '../styles/styles';
import ReviewDisplay from '../components/ReviewDisplay'

const FIND_MANY_REVIEW = gql`
    query($name: String!) {
        findManyReview(filter: {
            teacher: $name
        }) {
            teacher
            rating
            text
            timestamp
            version
        }
    }
`;

const TeacherPage = ({ pageContext, classes, location, courses, blocks, departments, semesters, theme }) => {
    const { name } = pageContext;

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(course => course.semester === semester);

    const [modalExposed, setModalExposed] = useState(false);

    const [rating, setRating] = useState(0);

    return (
        <Grid container direction='row' justify='space-between' alignItems='baseline' style={ {
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
                        marginBottom: theme.spacing(1)
                    } }>
                        <Typography variant='h6' style={ {
                            display: 'inline',
                            marginRight: theme.spacing(2)
                        } }>{ name }</Typography>
                        <StarRatings
                            rating={ isNaN(rating) ? 0 : rating }
                            starRatedColor='gold'
                            starHoverColor='gold'
                            numberOfStars={ 5 }
                            starDimension={ theme.spacing(5) }
                            starSpacing={ theme.spacing(0.5) }
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
                        marginTop: theme.spacing(1)
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
                                <ReviewForm
                                    teacher={ name }
                                    onClose={ () => setModalExposed(false) }
                                />
                            </Paper>
                        </Modal>
                    </div>
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
                        { ({ block }) => semesterCourses
                            .filter(course => course.block === block)
                            .map((course, idx) =>
                                <Chip
                                    key={ idx }
                                    className={ course.name.length > 25 ? classes.scalingText : null }
                                    label={ course.name }
                                    onClick={ () => navigate(`/courses/${ slugify(course.name, { lower: true }) }`, {
                                        state: {
                                            semester
                                        }
                                    }) }
                                />)
                        }
                    </ScheduleTable>
                </Grid>
            </Grid>
            <Grid>
                <Query
                    query={ FIND_MANY_REVIEW }
                    variables={ { name } }
                    onCompleted={ data => setRating(data.findManyReview.reduce((acc, cur) => acc + cur.rating, 0) / data.findManyReview.length) }
                    notifyOnNetworkStatusChange={ true }
                >
                    { ({ loading, error, data }) => {
                        if (loading || error) {
                            return <ReviewDisplay reviews={ [] }/>
                        } else {
                            return <ReviewDisplay reviews={ data.findManyReview }/>
                        }
                    } }
                </Query>
            </Grid>
        </Grid>
    );
}

export default withTheme(withProcessing(withStyles(styles)(TeacherPage)));

export const query = graphql`
    query($name: String!) {
        srapi {
            findManyCourse(filter: {
                teacher: $name
            }) {
                department
                semester
                name
                block
                room
            }
        }
    }
`;
