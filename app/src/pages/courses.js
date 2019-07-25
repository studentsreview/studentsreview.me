import React, { Fragment, useEffect, useState } from 'react'
import {
    Checkbox,
    FormGroup,
    FormControlLabel,
    Divider,
    IconButton,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography
} from '@material-ui/core';
import { IndeterminateCheckBox, AddBox } from '@material-ui/icons';
import { withStyles } from '@material-ui/styles';

import styles from '../styles/styles';
import { graphql, prefetchPathname, navigate } from 'gatsby';
import slugify from 'slugify';
import { getCurrentSemester, sortSemesters, splitSemester } from '../utils'
import { Helmet } from 'react-helmet'

const CollapsingTable = ({ title, table, initialValue }) => {
    const [collapsed, setCollapsed] = useState(initialValue || true);

    return (
        <Fragment>
            <Typography variant='h6' style={ { textAlign: 'center' } }>
                <IconButton onClick={ () => setCollapsed(!collapsed) }>
                    { collapsed ? <AddBox/> : <IndeterminateCheckBox/> }
                </IconButton>{ title }
            </Typography>
            {
                collapsed ? null : table
            }
        </Fragment>
    );
}

const CoursesPage = ({ classes, data }) => {
    // too much?
    useEffect(() => {
        for (let course of data.srapi.findManyCourse) {
            prefetchPathname(`/courses/${ slugify(course.name, { lower: true }) }`);
        }
    }, []);

    const [currentCoursesFilter, setCurrentCoursesFilter] = useState(true);

    const courses = data.srapi.findManyCourse.filter(course =>
        !currentCoursesFilter || course.semesters.includes(getCurrentSemester()));

    const courses_by_department = courses.reduce((acc, cur) => {
        if (Object.keys(acc).includes(cur.department)) {
            acc[cur.department].push(cur);
        } else {
            acc[cur.department] = [cur];
        }
        return acc;
    }, {});

    return (
        <div className={ classes.root }>
            <Helmet>
                <title>Courses</title>
                <meta name='description' content={ `See all Courses offered at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teachers'].join(',') }/>
            </Helmet>
            <FormGroup row>
                <FormControlLabel
                    control={ <Checkbox checked={ currentCoursesFilter } onChange={ e => setCurrentCoursesFilter(e.target.checked) }/> }
                    label='Current Courses Only'
                />
            </FormGroup>
            {
                Object.keys(courses_by_department).sort().map((department, idx) => (
                    <CollapsingTable
                        key={ idx }
                        title={ department }
                        table={ <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Years</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    courses_by_department[department].map((course, idx) => (
                                        <TableRow key={ idx }>
                                            <TableCell
                                                style={ { cursor: 'pointer', width: '50%' } }
                                                onClick={ () => navigate(`/courses/${ slugify(course.name, { lower: true }) }`) }
                                            >{ course.name }</TableCell>
                                            <TableCell>{ (() => {
                                                const semesters = sortSemesters(course.semesters);
                                                const start = semesters[0] !== 'Fall2014' ? splitSemester(semesters[0]) : 'Pre-Fall 2014';
                                                const end = splitSemester(semesters[semesters.length - 1]);
                                                return `${ start } - ${ end }`;
                                            })() }</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table> }
                    />
                )).reduce((acc, cur) => [acc, <Divider/>, cur])
            }
        </div>
    );
}

export const query = graphql`
    query {
        srapi {
            findManyCourse {
                name
                department
                semesters
            }
        }
    }
`;

export default withStyles(styles)(CoursesPage);
