import React from 'react';
import { Typography, Button, Grid, Divider, Paper, List, ListItem } from '@material-ui/core';
import { withStyles } from '@material-ui/styles'
import { Helmet } from 'react-helmet';
import { Query, withApollo } from 'react-apollo'
import InfiniteScroll from 'react-infinite-scroller';
import Review from '../components/Review';
import { OutboundLink } from 'gatsby-plugin-google-analytics';
import { Link } from 'gatsby';
import Icon from '@mdi/react';
import { mdiInstagram, mdiGithubCircle } from '@mdi/js';

import { prefetchPathname, useStaticQuery, navigate, graphql } from 'gatsby';
import { FIND_LATEST_REVIEWS } from '../graphql'
import { isWidthUp } from '@material-ui/core/withWidth';
import { splitSemester, sortSemesters, useWidth } from '../utils';
import slugify from 'slugify';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';

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
                    <Typography variant='h5' align='center'>Fall 2020 Course Selection Information</Typography>
                </Grid>
                <Grid item>
                    <OutboundLink href='https://docs.google.com/forms/d/e/1FAIpQLSd_Hv1b19BQWu9YiZh-3_GLeS2NlP_v2h36KBGb27PkYTyYFw/viewform' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body1' color='secondary'>Statement of Awareness Form</Typography>
                    </OutboundLink>
                </Grid>
                <Grid item>
                    <OutboundLink href='https://drive.google.com/file/d/1afwdSiNUCj2x1I3GcgWNZmuas-jpXEiR/view' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body1' color='secondary'>Statement of Awareness Video</Typography>
                    </OutboundLink>
                </Grid>
                <Grid item>
                    <OutboundLink href='https://docs.google.com/document/d/1CnM-ff73bMnli3BDGoKJAOZ5SHCrNP0ErcqA8S3zyE4/edit' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body1' color='secondary'>Course Descriptions</Typography>
                    </OutboundLink>
                </Grid>
            </Grid>
        </Paper>
    );
});

const IndexPage = ({ classes, client }) => {
    const width = useWidth();

    return (
        <>
            <Helmet>
                <title>Students Review</title>
                <meta name='description' content='Students Review is a teacher rating site for Lowell High School.'/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Review'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 } direction='row'>
                    { isWidthUp('sm', width) && <Grid item sm={ 3 }>
                        <Sidebar/>
                    </Grid> }
                    <Grid item xs={ 12 } sm={ 9 }>
                        <HeaderCard/>
                        <Typography variant='h4' className={ classes.control } style={ { textAlign: 'center' } }>Latest Reviews</Typography>
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
