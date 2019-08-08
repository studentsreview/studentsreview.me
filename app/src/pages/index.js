import React, { useEffect } from 'react'
import { Button, Divider, Typography, Grid, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/styles'
import { Helmet } from 'react-helmet';

import { graphql, prefetchPathname } from 'gatsby';
import { navigate } from '@reach/router';

import styles from '../styles/styles';

const Card = withStyles(theme => ({
    root: {
        [theme.breakpoints.up('sm')]: {
            height: '100%'
        }
    }
}))(Paper);

const IndexPage = ({ classes, data }) => {
    useEffect(() => {
        prefetchPathname('/teachers');
        prefetchPathname('/courses');
    }, [])

    return (
        <div className={ classes.root }>
            <Grid container spacing={ 3 }>
                <Helmet>
                    <title>Students Review</title>
                    <meta name='description' content='Students Review is a education website for students to share and read reviews of courses and teachers at Lowell High School.'/>
                    <meta name='keywords' content={ ['Education', 'Lowell High School', 'Review'].join(',') }/>
                </Helmet>
                <Grid item xs={ 12 } style={ { textAlign: 'center' } }>
                    <Typography variant='h4'>studentsreview.me</Typography>
                    <Typography variant='h6'>teacher and course database for lowell high school</Typography>
                </Grid>
                <Grid item xs={ 12 } style={ { textAlign: 'center' } }>
                    <Typography variant='h5' className={ classes.control }>Data</Typography>
                    <Divider/>
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <Card className={ classes.control }>
                        <Typography variant='h6'>Teachers</Typography>
                        <Typography variant='body1'>Search a database of { data.srapi.teacherCount.toLocaleString() } teachers that have taught at Lowell since 2014. Learn about their teaching styles and classroom experiences from { data.srapi.reviewCount.toLocaleString() } reviews.</Typography>
                        <Button variant='contained' onClick={ () => navigate('/teachers') }>View</Button>
                    </Card>
                </Grid>
                <Grid item xs={ 12 } sm={ 6 }>
                    <Card className={ classes.control }>
                        <Typography variant='h6'>Courses</Typography>
                        <Typography variant='body1'>Search a database of { data.srapi.courseCount.toLocaleString() } courses that have been offered at Lowell since 2014.</Typography>
                        <Button variant='contained' onClick={ () => navigate('/courses') }>View</Button>
                    </Card>
                </Grid>
                <Grid item xs={ 12 } style={ { textAlign: 'center' } }>
                    <Typography variant='h5' className={ classes.control }>Methodology</Typography>
                    <Divider/>
                </Grid>
                <Grid item xs={ 12 }>
                    <Paper className={ classes.control }>
                        <ul>
                            <li>Course, teacher and class data is aggregated from the past 5 years of Arena announcers from the school website.</li>
                            <li>The majority of teacher reviews were restored from ratemyteachers.com, with an increasing amount of original reviews generated from users on this site.</li>
                            <li>Courses refer to an overall collection of classes that are all part of that course. For example, while AP Statistics is a singular <i>course</i>, there would be several <i>classes</i> of AP Statistics offered at any point in time.</li>
                        </ul>
                    </Paper>
                </Grid>
            </Grid>
        </div>
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
