import React, { useState } from 'react';
import {
    Checkbox,
    FormControlLabel,
    IconButton,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@material-ui/core';
import { Maximize, Minimize } from '@material-ui/icons';
import { Helmet } from 'react-helmet';
import { withStyles } from '@material-ui/styles';

import slugify from 'slugify';
import { graphql, Link } from 'gatsby';
import { sortSemesters, formatSemesterRange, getCurrentSemester } from '../utils';

import styles from '../styles/styles';

const TableSection = ({ header, initialExpanded=true, children }) => {
    const [expanded, setExpanded] = useState(initialExpanded);

    return (
        <>
            <TableRow>
                <TableCell colSpan={ 3 } style={ { textAlign: 'center' } }>
                    <IconButton onClick={ () => setExpanded(!expanded) } size='small'>
                        { expanded ? <Minimize/> : <Maximize/> }
                    </IconButton>{ header }
                </TableCell>
            </TableRow>
            { expanded ? children : null }
        </>
    )
}

const TeachersPage = ({ classes, data }) => {
    const [currentTeachersFilter, setCurrentTeachersFilter] = useState(true);

    const departments = ['English', 'Math', 'Social Science', 'Science', 'Physical Education', 'Foreign Language', 'Computer Science', 'Miscellaneous'];


    const teachers = data.srapi.findManyTeacher
        .filter(teacher => (!currentTeachersFilter || teacher.semesters.includes(getCurrentSemester())));

    return (
        <>
            <Helmet>
                <title>Teachers</title>
                <meta name='description' content={ `See all teachers teaching at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teachers'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <FormControlLabel
                    control={ <Checkbox checked={ currentTeachersFilter } onChange={ e => setCurrentTeachersFilter(e.target.checked) }/> }
                    label='Current Teachers Only'
                />
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell style={ { width: '40%' } }>Name</TableCell>
                            <TableCell style={ { width: '30%' } }>Semesters</TableCell>
                            <TableCell style={ { width: '30%' } }>Departments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            departments.map((department, idx) => (
                                <TableSection key={ idx } header={ department }>
                                    {
                                        teachers
                                            .filter(teacher => teacher.departments.includes(department))
                                            .sort((a, b) => a.name.split(' ').slice(1).join(' ').localeCompare(b.name.split(' ').slice(1).join(' ')))
                                            .map((teacher, idx) => <TableRow key={ idx }>
                                                <TableCell style={ { cursor: 'pointer', width: '40%' } }>
                                                    <Link to={ `/teachers/${ slugify(teacher.name, { lower: true }) }` }>{ teacher.name }</Link>
                                                </TableCell>
                                                <TableCell style={ { width: '30%' } }>
                                                    { formatSemesterRange(sortSemesters(teacher.semesters)) }
                                                </TableCell>
                                                <TableCell style={ { width: '30%' } }>
                                                    { teacher.departments.join(', ') }
                                                </TableCell>
                                            </TableRow>)
                                    }
                                </TableSection>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

export const query = graphql`
    query {
        srapi {
            findManyTeacher(filter: {
                _operators: {
                    name: {
                        ne: "Undetermined"
                    }
                }
            }) {
                name
                departments
                semesters
            }
        }
    }
`;

export default withStyles(styles)(TeachersPage);
