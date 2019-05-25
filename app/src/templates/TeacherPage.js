import React, { useState } from 'react';
import Layout from '../components/layout';
import {
    Chip,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    withStyles,
    withWidth,
} from '@material-ui/core';
import { Helmet } from 'react-helmet';

import { isWidthDown } from '@material-ui/core/withWidth';
import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import slugify from 'slugify';

import styles  from '../styles/styles';

const TeacherPage = ({ pageContext, data, classes, location, width }) => {
    const { name } = pageContext;

    const blocks = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Block)));
    ['1', '2', '3', '4', '5', '6', '7', '8'].forEach(block => {
        if (!blocks.includes(String(block))) {
            blocks.push(String(block));
        }
    });
    blocks.sort((a, b) => +a - +b);

    const departments = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Department)));

    if (departments.includes('Miscellaneous') && departments.length > 1) {
        departments.splice(departments.indexOf('Miscellaneous'), 1);
    }

    const rooms = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Room)));

    const semesters = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Semester))).sort((a, b) => {
        a = /(Spring|Fall)(\d{4})/.exec(a);
        b = /(Spring|Fall)(\d{4})/.exec(b);
        return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
    });

    const initialSemester = location.state && location.state.semester ? location.state.semester : `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`;
    const [semester, setSemester] = useState(semesters.includes(initialSemester) ? initialSemester : semesters[0]);

    const semesterCourses = data.allMongodbStudentsReviewClasses.nodes
        .filter(node => node.Semester === semester);

    return <Layout direction='row' justify='space-between' alignItems='baseline' gridStyle={ {
        minHeight: '70%'
    } }>
        <Helmet>
            <title>{ name }</title>
        </Helmet>
        <Paper className={ classes.card }>
            <h3 style={ {
                display: 'inline',
                marginRight: 10
            } }>{ name }</h3>
            <Chip
                label={ `${ semesters[semesters.length - 1] !== 'Fall2014' ? /(Spring|Fall)(\d{4})/.exec(semesters[semesters.length - 1]).slice(1).join(' ') : 'Pre-Fall 2014' } - ${ /(Spring|Fall)(\d{4})/.exec(semesters[0]).slice(1).join(' ') }` }
            />
            <br/>
            {
                departments.map((department, idx) => <Chip
                    key={ idx }
                    style={ {
                        marginTop: 10,
                        background: {
                            Science: 'lightgreen',
                            Math: 'lightblue',
                            'Computer Science': 'orange',
                            English: '#e0e0e0',
                            'Physical Education': 'pink',
                            JROTC: '#b5651d',
                            'Visual Performing Arts': 'beige',
                            'Social Science': 'gold',
                            'Foreign Language': '#e6e6fa'
                        }[department]
                    } }
                    label={ department }
                />)
            }
            <h4>Fun Facts</h4>
            <p>
                Favorite Room: { rooms.reduce((acc, cur) => {
                const count = data.allMongodbStudentsReviewClasses.nodes.map(node => node.Room).filter(room => room === cur).length;
                if (count > data.allMongodbStudentsReviewClasses.nodes.map(node => node.Room).filter(room => room === acc).length) {
                    return cur;
                } else {
                    return acc;
                }
            }) }
            </p>
            <p>
                Classes per Semester: { (data.allMongodbStudentsReviewClasses.nodes.length / semesters.length).toFixed(2) }
            </p>
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
                                                        style={ node.Course_Name.length > 25 && isWidthDown('xs', width) ? {
                                                            fontSize: '1.75vw'
                                                        } : null }
                                                        key={ idx }
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
    </Layout>;
}

export default withWidth()(withStyles(styles)(TeacherPage));

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
    }
`;
