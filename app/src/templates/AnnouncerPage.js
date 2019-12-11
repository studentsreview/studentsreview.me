import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'gatsby';
import TableSection from '../components/TableSection';

import { graphql } from 'gatsby';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import slugify from 'slugify';
import { splitSemester } from '../utils';

import styles from '../styles/styles';

const AnnouncerPage = ({ classes, data, pageContext }) => {
    const { semester } = pageContext;

    const departments = ['English', 'Math', 'Social Science', 'Science', 'Physical Education', 'Foreign Language', 'Computer Science', 'Miscellaneous'];

    const classes_ = data.srapi.findManyClass;

    return (
        <>
            <Helmet>
                <title>{ `${ splitSemester(semester) } Announcer` }</title>
                <meta name='description' content={ `` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Announcer', splitSemester(semester)] }/>
            </Helmet>
            <div className={ classes.root }>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell style={ { width: '35%' } }>Name</TableCell>
                            <TableCell style={ { width: '35%' } }>Teacher</TableCell>
                            <TableCell style={ { width: '30%' } }>Block</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            departments.map((department, idx) => (
                                <TableSection key={ idx } header={ department } colSpan={ 3 }>
                                    {
                                        classes_
                                            .filter(class_ => class_.department === department)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((class_, idx) => <TableRow key={ idx }>
                                                <TableCell style={ { cursor: 'pointer', width: '35%' } }>
                                                    <Link to={ `/courses/${ slugify(class_.name, { lower: true }) }` }>{ class_.name } { class_.section ? class_.section : null }</Link>
                                                </TableCell>
                                                <TableCell style={ { cursor: 'pointer', width: '35%' } }>
                                                    <Link to={ `/teachers/${ slugify(class_.teacher, { lower: true }) }` }>{ class_.teacher }</Link>
                                                </TableCell>
                                                <TableCell style={ { width: '30%' } }>{ class_.block }</TableCell>
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

export default withStyles(styles)(AnnouncerPage);

export const query = graphql`
    query($semester: String!)  {
        srapi {
            findManyClass(filter: {
                semester: $semester
            }) {
                name
                section
                block
                teacher
                department
            }
        }
    }
`;
