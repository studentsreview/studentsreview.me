import React, { useRef, useState } from 'react';
import {
    Button,
    ClickAwayListener,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Popper,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { FilterList } from '@material-ui/icons';
import { createStyles, withStyles } from '@material-ui/styles';

import slugify from 'slugify';
import { graphql, Link } from 'gatsby';
import { sortSemesters, splitSemester, getCurrentSemester, combineStyles } from '../utils';

import styles from '../styles/styles';

const styles0 = createStyles({
    gutters: {
        '& > *': {
            marginRight: 5
        }
    }
});

const TeachersPage = ({ classes, data }) => {
    const [currentTeachersFilter, setCurrentTeachersFilter] = useState(true);
    const [departmentFilterMenuOpen, setDepartmentFilterMenuOpen] = useState(false);

    const buttonRef = useRef(null);

    const departments = data.srapi.findManyTeacher.reduce((acc, cur) => {
        for (let department of cur.departments) {
            if (!acc.includes(department)) {
                acc.push(department);
            }
        }
        return acc;
    }, []).sort();

    const [departmentFilter, setDepartmentFilter] = useState(departments.filter(el => el !== 'Miscellaneous'));

    const teachers = data.srapi.findManyTeacher.filter(teacher =>
        (!currentTeachersFilter || teacher.semesters.includes(getCurrentSemester())) && teacher.departments.some(department => departmentFilter.includes(department)));

    return (
        <>
            <Helmet>
                <title>Teachers</title>
                <meta name='description' content={ `See all teachers teaching at Lowell High School.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Teachers'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <FormGroup row className={ classes.gutters }>
                    <Button
                        ref={ buttonRef }
                        onClick={ () => setDepartmentFilterMenuOpen(!departmentFilterMenuOpen) }
                    ><FilterList/>Filter Departments</Button>
                    <Popper anchorEl={ buttonRef.current } open={ departmentFilterMenuOpen }>
                        <ClickAwayListener onClickAway={ () => setDepartmentFilterMenuOpen(false) }>
                            <Paper className={ classes.control }>
                                <FormGroup>
                                    {
                                        departmentFilter.length === 0 ?
                                            <Button variant='outlined' onClick={ () => setDepartmentFilter(departments) }>Select All</Button> :
                                            <Button variant='outlined' onClick={ () => setDepartmentFilter([]) }>Deselect All</Button>
                                    }
                                    {
                                        departments.map((department, idx) => (
                                            <FormControlLabel
                                                key={ idx }
                                                control={ <Checkbox
                                                    checked={ departmentFilter.includes(department) }
                                                    onChange={ () => departmentFilter.includes(department) ?
                                                        setDepartmentFilter(departmentFilter.filter(el => el !== department)) :
                                                        setDepartmentFilter(departmentFilter.concat(department)) }/>
                                                }
                                                label={ department }
                                            />
                                        ))
                                    }
                                </FormGroup>
                            </Paper>
                        </ClickAwayListener>
                    </Popper>
                    <FormControlLabel
                        control={ <Checkbox checked={ currentTeachersFilter } onChange={ e => setCurrentTeachersFilter(e.target.checked) }/> }
                        label='Current Teachers Only'
                    />
                </FormGroup>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Semesters</TableCell>
                            <TableCell>Department(s)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            teachers.map((teacher, idx) => (
                                <TableRow key={ idx }>
                                    <TableCell style={ { cursor: 'pointer', width: '33%' } }>
                                        <Link to={ `/teachers/${ slugify(teacher.name, { lower: true }) }` }>{ teacher.name }</Link>
                                    </TableCell>
                                    <TableCell style={ { width: '33%' } }>{ (() => {
                                        const semesters = sortSemesters(teacher.semesters);
                                        const start = semesters[semesters.length - 1] !== 'Fall2014' ? splitSemester(semesters[semesters.length - 1]) : 'Pre-Fall 2014';
                                        const end = splitSemester(semesters[0]);
                                        return `${ start } - ${ end }`;
                                    })() }</TableCell>
                                    <TableCell>{ teacher.departments.join(', ') }</TableCell>
                                </TableRow>
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

export default withStyles(combineStyles(styles, styles0))(TeachersPage);
