import React, { useEffect } from 'react'
import { Button, Typography, Grid, Divider } from '@material-ui/core';
import { withStyles, useTheme } from '@material-ui/styles'
import { Helmet } from 'react-helmet';
import { Query } from 'react-apollo';
import Review from '../components/Review';

import { graphql, prefetchPathname } from 'gatsby';
import { Link, navigate } from '@reach/router'
import slugify from 'slugify';
import { FIND_LATEST_REVIEWS } from '../graphql'

import styles from '../styles/styles';

const IndexPage = ({ classes, data }) => {
    useEffect(() => {
        prefetchPathname('/teachers');
        prefetchPathname('/courses');
    }, []);

    const theme = useTheme();

    return (
        <>
            <Helmet>
                <title>Students Review</title>
                <meta name='description' content='Students Review is a education website for students to share and read reviews of courses and teachers at Lowell High School.'/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Review'].join(',') }/>
            </Helmet>
            <Grid item xs={ 12 } style={ { background: theme.palette.primary.light, paddingTop: theme.spacing(7.5), paddingBottom: theme.spacing(7.5), textAlign: 'center' } }>
                <Typography variant='h4'>studentsreview.me</Typography>
                <Typography variant='h6'>teacher and course database for lowell high school</Typography>
                <div style={ { paddingTop: theme.spacing(2.5) } }>
                    <Button variant='contained' size='large' onClick={ () => navigate('/teachers') } style={ { marginRight: theme.spacing(2.5) } }>Teachers</Button>
                    <Button variant='contained' size='large' onClick={ () => navigate('/courses') }>Courses</Button>
                </div>
            </Grid>
            <Grid item xs={ 12 } style={ { background: theme.palette.secondary.light, paddingTop: theme.spacing(7.5), paddingBottom: theme.spacing(7.5), textAlign: 'center' } }>
                <Typography variant='body1'>
                    This database contains { data.srapi.courseCount.toLocaleString() } courses, { data.srapi.teacherCount.toLocaleString() } teachers and { data.srapi.reviewCount.toLocaleString() } reviews.
                </Typography>
            </Grid>
            <Grid item xs={ 12 } style={ { marginLeft: theme.spacing(5), marginRight: theme.spacing(5) } }>
                <Query query={ FIND_LATEST_REVIEWS }>
                    { ({ data, loading }) => {
                        if (loading) {
                            return (
                                <>
                                    <Typography variant='h5' className={ classes.control } style={ { textAlign: 'center' } }>Latest Reviews</Typography>
                                    <Typography variant='body1' className={ classes.control } style={ { textAlign: 'center' } }>Loading...</Typography>
                                </>
                            );
                        } else {
                            return (
                                <>
                                    <Typography variant='h5' className={ classes.control } style={ { textAlign: 'center' } }>Latest Reviews</Typography>
                                    { data.findManyReview
                                        .map((review, idx) => (
                                            <Link to={ `/teachers/${ slugify(review.teacher, { lower: true }) }` }>
                                                <Review key={ idx } review={ review } teacher={ review.teacher }/>
                                            </Link>
                                        ))
                                        .reduce((acc, cur) => [acc, <Divider/>, cur]) }
                                </>
                            );
                        }
                    } }
                </Query>
            </Grid>
        </>
    );
}

export const query = graphql`
    query {
        srapi {
            courseCount
            reviewCount
            teacherCount
        }
    }
`;

export default withStyles(styles)(IndexPage);
