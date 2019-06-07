import React, { useState } from 'react';
import { Button, Chip, Grid, Paper, Typography, ClickAwayListener, withStyles } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import StarRatings from 'react-star-ratings';
import IosClose from 'react-ionicons/lib/IosClose';
import ReviewForm from '../components/ReviewForm';
import DepartmentChip from '../components/DepartmentChip';
import Modal from '../components/Modal';
import SemesterSelect from '../components/SemesterSelect';
import ScheduleTable from '../components/ScheduleTable';
import ReviewDisplay from '../components/ReviewDisplay';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';
import { FIND_REVIEWS } from '../graphql';
import { splitSemester, getCurrentSemester, getBlocks, removeDupes } from '../utils';

import styles from '../styles/styles';

const TeacherPage = ({ pageContext, classes, location, data, theme }) => {
    const { name } = pageContext;

    const courses = data.srapi.findManyCourse;
    const semesters = removeDupes(data.srapi.findManyCourse.map(course => course.semester)).sort((a, b) => {
        a = /(Spring|Fall)(\d{4})/.exec(a);
        b = /(Spring|Fall)(\d{4})/.exec(b);
        return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
    });
    const departments = data.srapi.findOneTeacher.departments;

    const initialSemester = location.state && location.state.semester ? location.state.semester : getCurrentSemester();
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = courses
        .filter(course => course.semester === semester);

    const [modalExposed, setModalExposed] = useState(false);

    const [rating, setRating] = useState(0);

    return (
        <div className={ classes.root }>
            <Grid container spacing={ 3 }>
                <Helmet>
                    <title>{ name }</title>
                    <meta name='description' content={ `See students' reviews of ${ name }, a teacher at Lowell High School.` }/>
                    <meta name='keywords' content={ departments.concat(['Education', 'Lowell High School', 'Teacher', name].concat(departments)).join(',') }/>
                </Helmet>
                <Grid item xs={ 12 } sm={ 5 }>
                    <Paper className={ classes.control }>
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
                            label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? splitSemester(semesters[semesters.length - 1]) : 'Pre-Fall 2014' } - ${ splitSemester(semesters[0]) }` }
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
                                disabled={ !semesters.includes(getCurrentSemester()) }
                                onClick={ () => setModalExposed(true) }
                            >Write a Review</Button>
                            <Modal shown={ modalExposed }>
                                <Grid item xs={ 12 } sm={ 6 }>
                                    <ClickAwayListener onClickAway={ () => setModalExposed(false) }>
                                        <Paper className={ classes.control }>
                                            <IosClose onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }/>
                                            <ReviewForm
                                                teacher={ name }
                                                onClose={ () => setModalExposed(false) }
                                            />
                                        </Paper>
                                    </ClickAwayListener>
                                </Grid>
                            </Modal>
                        </div>
                    </Paper>
                    <SemesterSelect
                        semesters={ semesters }
                        value={ semester }
                        onChange={ setSemester }
                    />
                    <ScheduleTable
                        blocks={ getBlocks().concat(removeDupes(semesterCourses.map(course => course.block).filter(block => block > 8))) }
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
                                            semester: semester === semesters[0] ? null : semester
                                        }
                                    }) }
                                />)
                        }
                    </ScheduleTable>
                </Grid>
                <Grid item xs={ 12 } sm={ 7 }>
                    <Query
                        query={ FIND_REVIEWS }
                        variables={ { name } }
                        onCompleted={ data => setRating(data.findOneTeacher.rating) }
                        notifyOnNetworkStatusChange={ true }
                    >
                        { ({ data }) => <ReviewDisplay teacher={ name } reviews={ data.reviewPagination }/> }
                    </Query>
                </Grid>
            </Grid>
        </div>
    );
}

export default withStyles(styles)(withTheme(TeacherPage));

export const query = graphql`
    query($name: String!) {
        srapi {
            findOneTeacher(filter: {
                name: $name
            }) {
                departments
            }
            findManyCourse(filter: {
                teacher: $name
            }) {
                semester
                name
                block
            }
        }
    }
`;
