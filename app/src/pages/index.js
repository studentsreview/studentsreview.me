import React, { useEffect, useState } from 'react';
import { Typography, Grid, Divider, Paper, List, ListItem, MenuItem, Select } from '@material-ui/core';
import { withStyles, useTheme } from '@material-ui/styles'
import { Helmet } from 'react-helmet';
import { Query, withApollo } from 'react-apollo'
import InfiniteScroll from 'react-infinite-scroller';
import Review from '../components/Review';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { Link } from 'gatsby';
import Icon from '@mdi/react';
import { mdiInstagram, mdiGithubCircle } from '@mdi/js';
import { ResponsiveLine } from '@nivo/line';
import { TableTooltip } from '@nivo/tooltip';

import { prefetchPathname, useStaticQuery, navigate, graphql } from 'gatsby';
import { FIND_LATEST_REVIEWS, GET_SEMESTER_CLASSES } from '../graphql'
import { isWidthUp } from '@material-ui/core/withWidth';
import { splitSemester, sortSemesters, useWidth, removeDupes, shortenTeacherName } from '../utils'
import slugify from 'slugify';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';
import axios from 'axios';

import styles from '../styles/styles';

const Sidebar = withStyles(styles)(({ classes }) => {
    const data = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    announcers
                }
            }
        }
    `);

    const links = [
        { icon: mdiInstagram, link: 'https://urlgeni.us/instagram/lhssr' },
        { icon: mdiGithubCircle, link: 'https://www.github.com/kajchang/studentsreview.me' }
    ];

    return (
        <Paper className={ classes.control }>
            <List>
                <ListItem><Typography variant='body1'>Announcers</Typography></ListItem>
                <Divider/>
                { sortSemesters(data.site.siteMetadata.announcers).map((announcer, idx) => <ListItem key={ idx }>
                    <Link to={ `/announcers/${ announcer.toLowerCase() }` }>
                        <Typography variant='body2'>{ splitSemester(announcer) }</Typography>
                    </Link>
                </ListItem>) }
                <ListItem><Typography variant='body1'>Links</Typography></ListItem>
                <Divider/>
                <ListItem>
                    { links.map(({ icon, link }, idx) => (
                        <OutboundLink key={ idx } href={ link } target='_blank' rel='noopener noreferrer'>
                            <Icon
                                path={ icon }
                                size={ 1 }
                                color='black'
                                style={ { marginRight: 5 } }
                            />
                        </OutboundLink>
                    )) }
                </ListItem>
                <ListItem>
                    <OutboundLink href='https://www.iubenda.com/privacy-policy/95214385/legal' target='_blank' rel='noopener noreferrer'>Privacy Policy</OutboundLink>
                </ListItem>
                <ListItem>
                    <Typography variant='body2'>Created by Kai Chang</Typography>
                </ListItem>
            </List>
        </Paper>
    );
});

const HeaderCard = withStyles(styles)(({ classes }) => {
    return (
        <Paper className={ classes.control }>
            <Grid container direction='column' alignItems='center' spacing={ 3 }>
                <Grid item>
                    <Typography variant='h5' align='center'>Course Selection Information</Typography>
                </Grid>
                <Grid item>
                    <OutboundLink href='https://docs.google.com/spreadsheets/u/1/d/19HiRTFWIwjkuS-Le_PJAobLM0vA4IY8GkMs9P1_g9Mo/edit#gid=0' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body1' color='secondary'>2020-2021 Class Announcer</Typography>
                    </OutboundLink>
                </Grid>
                <Grid item>
                    <OutboundLink href='https://docs.google.com/document/d/1bRE4BhiQv8XFceqO7sGFkIp7jKozAxdUh3qdF8JG5sU/edit' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body1' color='secondary'>Arena Timeline</Typography>
                    </OutboundLink>
                </Grid>
            </Grid>
        </Paper>
    );
});

const SeatsWidget = withStyles(styles)(({ classes, client, semesters, liveSeatsUrl }) => {
    const theme = useTheme();
    const width = useWidth();

    const [semesterClasses, setSemesterClasses] = useState([]);
    const [liveSeatData, setLiveSeatData] = useState({});

    const [selectedDepartment, setSelectedDepartment] = useState('')
    const [selectedClassName, setSelectedClassName] = useState('');
    const [selectedSemester, setSelectedSemester] = useState(semesters[0]);

    useEffect(() => {
        for (let semester of semesters) {
            client.query({
                query: GET_SEMESTER_CLASSES,
                variables: {
                    semester
                }
            })
                .then(({ data: { findManyClass } }) => {
                    setSemesterClasses(previousSemesterClasses => {
                        if (semester === semesters[0]) {
                            setSelectedDepartment(findManyClass[0].department);
                            setSelectedClassName(findManyClass[0].name);
                        }
                        return previousSemesterClasses.concat(findManyClass.filter(semesterClass => !!semesterClass.seats));
                    });
                });
        }

        axios.get(liveSeatsUrl)
            .then(({ data }) => setLiveSeatData(data));
    }, []);

    useEffect(() => {
        if (selectedDepartment === '') return;
        setSelectedClassName(semesterClasses.find(semesterClass => semesterClass.department === selectedDepartment).name);
    }, [selectedDepartment]);
    useEffect(() => {
        if (selectedClassName === '') return;
        setSelectedSemester(semesterClasses.find(semesterClass => semesterClass.name === selectedClassName).semester);
    }, [selectedClassName]);

    let selectedClasses = semesterClasses
        .filter(semesterClass => semesterClass.name === selectedClassName);

    let yearLongCourseSelected = selectedClasses.length % 2 === 0;
    if (yearLongCourseSelected) {
        const selectedClassesCopy = selectedClasses.slice();
        while (selectedClassesCopy.length > 0) {
            const classToMatch = selectedClassesCopy.pop();
            const matchIndex = selectedClassesCopy.findIndex(selectedClassCopy =>
                selectedClassCopy.teacher === classToMatch.teacher &&
                selectedClassCopy.block === classToMatch.block &&
                selectedClassCopy.semester !== classToMatch.semester &&
                selectedClassCopy.seats.every((seats, idx) => seats === classToMatch.seats[idx])
            );
            selectedClassesCopy.splice(matchIndex, 1);
            if (matchIndex === -1) {
                yearLongCourseSelected = false;
                break;
            }
        }
    }

    if (yearLongCourseSelected) {
        selectedClasses = selectedClasses.filter(selectedClass => selectedClass.semester === semesters[0]);
    } else {
        selectedClasses = selectedClasses.filter(selectedClass => selectedClass.semester === selectedSemester);
    }

    const getLiveSeatCount = query => {
        for (let department of Object.keys(liveSeatData)) {
            for (let className of Object.keys(liveSeatData[department])) {
                for (let teacher of Object.keys(liveSeatData[department][className])) {
                    if (teacher
                        .replace(/\./g, '')
                        .replace(/([a-z]) (.+)$/g, (_, p1) => p1)
                        .split(',').every(segment => query.teacher.includes(segment.trim()))
                    ) {
                        for (let class_ of liveSeatData[department][className][teacher]) {
                            if (class_[0] === query.block && (
                                (query.length === 'Year' && class_[1] === 'Both') ||
                                (query.length === 'Semester' && semesters[Number(class_[1]) - 1] === query.semester)
                            )) {
                                return class_[2];
                            }
                        }
                    }
                }
            }
        }
    }

    return (
        <Paper className={ classes.control } style={ { height: isWidthUp('sm', width) ? '50vh': '75vh', marginTop: theme.spacing(2) } }>
            <Typography variant='h5' className={ classes.control } style={ { textAlign: 'center' } }>Seat Tracker</Typography>
            <Select
                value={ selectedDepartment }
                onChange={ e => {
                    trackCustomEvent({
                        category: 'Department Select',
                        action: 'Select',
                        label: e.target.value
                    });
                    setSelectedDepartment(e.target.value);
                } }
            >
                {
                    removeDupes(semesterClasses.map(semesterClass => semesterClass.department))
                        .sort()
                        .map((department, idx) => (
                            <MenuItem value={ department } key={ idx }>{ department }</MenuItem>
                        ))
                }
            </Select>
            <Select
                value={ selectedClassName }
                onChange={ e => {
                    trackCustomEvent({
                        category: 'Class Name Select',
                        action: 'Select',
                        label: e.target.value
                    });
                    setSelectedClassName(e.target.value);
                } }
            >
                {
                    removeDupes(semesterClasses
                        .filter(semesterClass => semesterClass.department === selectedDepartment)
                        .map(semesterClass => semesterClass.name)
                    )
                        .map((className, idx) => (
                            <MenuItem value={ className } key={ idx }>{ className }</MenuItem>
                        ))
                }
            </Select>
            {
                !yearLongCourseSelected ? <Select
                    value={ selectedSemester }
                    renderValue={ val => splitSemester(val) }
                    onChange={ e => {
                        trackCustomEvent({
                            category: 'Semester Select',
                            action: 'Select',
                            label: e.target.value
                        });
                        setSelectedSemester(e.target.value);
                    } }
                >
                    {
                        semesters
                            .map((semester, idx) => (
                                <MenuItem value={ semester } key={ idx }>{ splitSemester(semester) }</MenuItem>
                            ))
                    }
                </Select> : null
            }
            <ResponsiveLine
                data={
                    selectedClasses
                        .sort((a, b) => b.block - a.block)
                        .map(semesterClass => ({
                            id: JSON.stringify(Object.assign({_: Math.random(), ...semesterClass})),
                            data: semesterClass.seats.map((seats, i) => ({x: i, y: seats})).concat([{
                                x: 'Live',
                                y: getLiveSeatCount(semesterClass) || 0
                            }])
                        }))
                }
                margin={ { bottom: 170, left: 70, top: 10, right: 10 } }
                xScale={ { type: 'point' } }
                yScale={ { type: 'linear', min: 0, max: 'auto', reverse: false } }
                axisBottom={ {
                    orient: 'bottom',
                    legend: 'Rotation / Pick',
                    legendOffset: 35,
                    tickSize: 5,
                    tickPadding: 5,
                    legendPosition: 'middle'
                } }
                axisLeft={ {
                    orient: 'left',
                    legend: 'Seats',
                    legendOffset: -40,
                    tickSize: 5,
                    tickPadding: 5,
                    legendPosition: 'middle'
                } }
                colors={ { scheme: 'nivo' } }
                pointSize={ 10 }
                pointColor={ { theme: 'background' } }
                pointBorderWidth={ 2 }
                pointBorderColor={ { from: 'serieColor' } }
                useMesh={ true }
                enableSlices='x'
                sliceTooltip={ ({ slice }) => (
                    <TableTooltip
                        rows={ slice.points.map(point => {
                            const pointClass = JSON.parse(point.serieId);
                            return [
                                <span style={{ display: 'block', width: '12px', height: '12px', background: point.serieColor }}/>,
                                `Block ${ pointClass.block } - ${ shortenTeacherName(pointClass.teacher) }`,
                                <strong>{ point.data.yFormatted } Seat{ point.data.y !== 1 ? 's' : '' } Left</strong>
                            ];
                        }) }
                    />
                ) }
            />
        </Paper>
    );
});

const IndexPage = ({ classes, client }) => {
    const width = useWidth();

    return (
        <>
            <Helmet>
                <title>Students Review</title>
                <meta name='google-site-verification' content='Eibu7BNTmaTy7LrXwVV-i0qffe8pjZZL0YvB-1cpSlQ'/>
                <meta name='description' content='Students Review is a teacher review and course information site for students at Lowell High School in San Francisco.'/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Review', 'San Francisco', 'Teacher', 'Course'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 } direction='row'>
                    { isWidthUp('sm', width) && <Grid item sm={ 3 }>
                        <Sidebar/>
                    </Grid> }
                    <Grid item xs={ 12 } sm={ 9 }>
                        <HeaderCard/>
                        <SeatsWidget client={ client } semesters={ ['Fall2020', 'Spring2021'] } liveSeatsUrl='https://arenarolodexscraper.herokuapp.com/'/>
                        <Typography variant='h5' className={ classes.control } style={ { textAlign: 'center' } }>Latest Reviews</Typography>
                        <Query
                            query={ FIND_LATEST_REVIEWS }
                            variables={ {
                                page: 1
                            } }
                            onCompleted={ data => {
                                for (let review of data.reviewPagination.items) {
                                    prefetchPathname(`/teachers/${ slugify(review.teacher, { lower: true }) }`);
                                }
                            } }
                            notifyOnNetworkStatusChange={ true }
                        >
                            { ({ data }) => <InfiniteScroll
                                pageStart={ 1 }
                                initialLoad={ false }
                                loader={ <Typography variant='body1' style={ { textAlign: 'center' } } key={ 1 }>Loading More Reviews...</Typography> }
                                loadMore={ page => {
                                    trackCustomEvent({
                                        category: 'Latest Review Display',
                                        action: 'Scroll',
                                        value: page
                                    });
                                    client.query({
                                        query: FIND_LATEST_REVIEWS,
                                        variables: {
                                            page
                                        }
                                    })
                                        .then(({ data: { reviewPagination: { pageInfo, items, __typename } } }) => {
                                            const { reviewPagination } = client.cache.readQuery({
                                                query: FIND_LATEST_REVIEWS,
                                                variables: {
                                                    page: 1
                                                }
                                            });

                                            client.cache.writeQuery({
                                                query: FIND_LATEST_REVIEWS,
                                                data: {
                                                    reviewPagination: {
                                                        pageInfo,
                                                        items: reviewPagination.items.concat(items),
                                                        __typename
                                                    },
                                                },
                                                variables: {
                                                    page: 1
                                                }
                                            });
                                        });
                                } }
                                hasMore={ data.reviewPagination && data.reviewPagination.pageInfo.hasNextPage }
                            >
                                { data.reviewPagination ? data.reviewPagination.items
                                    .map((review, idx) =>
                                        <Review key={ idx } onClick={ () => navigate(`/teachers/${ slugify(review.teacher, { lower: true }) }`) } review={ review } teacher={ review.teacher } showTeacher={ true }/>)
                                    .reduce((acc, cur) => [acc, <Divider/>, cur]) : <Typography variant='body1' style={ { textAlign: 'center' } } key={ 1 }>Loading Latest Reviews...</Typography> }
                            </InfiniteScroll> }
                        </Query>
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export default withStyles(styles)(withApollo(IndexPage));
