import React from 'react'
import { Typography, Button, Grid, Divider, Paper, List, ListItem } from '@material-ui/core';
import { withStyles } from '@material-ui/styles'
import { Helmet } from 'react-helmet';
import { Query, withApollo } from 'react-apollo'
import InfiniteScroll from 'react-infinite-scroller';
import Review from '../components/Review';
import { OutboundLink } from 'gatsby-plugin-google-analytics';

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

    return (
        <Paper className={ classes.control }>
            <List>
                <ListItem><Typography variant='body1'>Announcers</Typography></ListItem>
                <Divider/>
                { sortSemesters(data.site.siteMetadata.announcers).map((announcer, idx) => <ListItem key={ idx }>
                    <OutboundLink href={ `${ process.env.GRAPHQL_URI }/data/${ announcer }.pdf` } target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body2'>{ splitSemester(announcer) }</Typography>
                    </OutboundLink>
                </ListItem>) }
                <ListItem><Typography variant='body1'>Links</Typography></ListItem>
                <Divider/>
                <ListItem>
                    <OutboundLink href={ process.env.GRAPHQL_URI } target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body2'>GraphQL API</Typography>
                    </OutboundLink>
                </ListItem>
                <ListItem>
                    <OutboundLink href='https://github.com/kajchang/studentsreview.me' target='_blank' rel='noopener noreferrer'>
                        <Typography variant='body2'>Source</Typography>
                    </OutboundLink>
                </ListItem>
                <ListItem>
                    <Typography variant='body2'>Created by Kai Chang</Typography>
                </ListItem>
            </List>
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
                        <Paper className={ classes.control }>
                            <Grid container direction='column' alignItems='center'>
                                <Typography className={ classes.control } variant='h5'>Making an Arena Schedule?</Typography>
                                <OutboundLink href='https://arena.lowellhs.com' target='_blank' rel='noopener noreferrer'>
                                    <Button variant='contained' color='secondary'>Check out Arena Rolodex!</Button>
                                </OutboundLink>
                            </Grid>
                        </Paper>
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
}

export default withStyles(styles)(withApollo(IndexPage));
