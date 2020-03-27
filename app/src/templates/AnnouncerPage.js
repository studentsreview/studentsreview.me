import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'gatsby';
import TableSection from '../components/TableSection';

import { graphql } from 'gatsby';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import slugify from 'slugify';
import { LowellHighSchool } from '../schema';
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
                <meta name='description' content={ `View the classes offered at Lowell High School in ${ splitSemester(semester) }.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Announcer', splitSemester(semester)] }/>
                <script type='application/ld+json'>
                    { JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'DigitalDocument',
                        name: `${ splitSemester(semester) } Announcer`,
                        accessMode: 'textual',
                        publisher: LowellHighSchool
                    }) }
                </script>
            </Helmet>
            <div className={ classes.root }>
                <Table size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell style={ { width: '10%', textAlign: 'center' } }>Block</TableCell>
                            <TableCell style={ { width: '45%', textAlign: 'center' } }>Course</TableCell>
                            <TableCell style={ { width: '45%', textAlign: 'center' } }>Teacher</TableCell>
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
                                                <TableCell style={ { width: '10%', textAlign: 'center' } }>{ class_.block }</TableCell>
                                                <TableCell style={ { cursor: 'pointer', width: '45%', textAlign: 'center' } }>
                                                    <Link to={ `/courses/${ slugify(class_.name, { lower: true }) }` }>{ class_.name } { class_.section ? class_.section : null }</Link>
                                                </TableCell>
                                                <TableCell style={ { cursor: 'pointer', width: '45%', textAlign: 'center' } }>
                                                    <Link to={ `/teachers/${ slugify(class_.teacher, { lower: true }) }` }>{ class_.teacher }</Link>
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
};

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
