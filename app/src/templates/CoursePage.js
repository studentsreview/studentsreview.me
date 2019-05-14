import React, { useState } from 'react';
import { graphql } from 'gatsby';
import { Paper, Grid, Select, MenuItem, Chip, Table, TableBody, TableRow, TableCell, withStyles } from '@material-ui/core'
import Layout from '../components/layout';

import { navigate } from '@reach/router';
import slugify from 'slugify';

import { card } from '../styles/styles';

const TeacherPage = ({ pageContext, data, classes }) => {
    const { name } = pageContext;

    const codes = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Course_Code)));
    const blocks = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Block)));
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(block => {
        if (!blocks.includes(String(block))) {
            blocks.push(String(block));
        }
    });
    blocks.sort();
    const semesters = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Semester))).sort((a, b) => {
        a = /(Spring|Fall)(\d{4})/.exec(a);
        b = /(Spring|Fall)(\d{4})/.exec(b);
        return (Number(b[2]) + (b[1] === 'Spring' ? 0 : 0.5)) - (Number(a[2]) + (a[1] === 'Spring' ? 0 : 0.5));
    });

    const [semester, setSemester] = useState(semesters[0]);

    return <Layout direction='row' justify='space-between' alignItems='baseline' gridStyle={ {
        minHeight: '70%'
    } }>
        <Paper className={ classes.card }>
            <h3>{ name }</h3>
            <p>Course Code: { codes.join(', ') }</p>
            <p>Department: { data.allMongodbStudentsReviewClasses.nodes[0].Department }</p>
        </Paper>
        <div className={ classes.card }>
            <Grid container direction='column' justify='center'>
                <Select value={ semester }
                        renderValue={ val => <MenuItem>{ /(Spring|Fall)(\d{4})/.exec(val).slice(1).join(' ') }</MenuItem> }
                        onChange={ (_, child) => setSemester(child.props.value) }
                        style={ { width: '33%' } }
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
                            blocks.map((block, idx) => <TableRow key={ idx }>
                                <TableCell>{ block }</TableCell>
                                <TableCell>
                                    {
                                        Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes
                                            .filter(node => node.Block === block && node.Teacher !== 'Undetermined' && node.Semester === semester)
                                            .map(node => node.Teacher)
                                        ))
                                            .map((teacher, idx) =>
                                                <Chip
                                                    key={ idx }
                                                    label={ teacher.split(' ')[teacher.split(' ').length - 1] }
                                                    onClick={ () => navigate(`/teachers/${ slugify(teacher, { lower: true }) }`) }
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

export default withStyles({ card })(TeacherPage);

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Course_Name: {
                eq: $name
            }
        }) {
            nodes {
                Course_Name,
                Course_Code,
                Department,
                Semester,
                Teacher,
                Block
            }
        }
    }
`;
