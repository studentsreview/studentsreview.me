import React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Typography } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { Link } from 'gatsby';
import TableSection from '../components/TableSection';

import { graphql } from 'gatsby';
import { navigate } from '@reach/router';
import { withStyles } from '@material-ui/styles';
import slugify from 'slugify';
import { LowellHighSchool } from '../schema';
import { splitSemester, removeDupes } from '../utils';

import styles from '../styles/styles';

const AnnouncerPage = ({ classes, data, pageContext }) => {
    const { semester } = pageContext;

    const departments = ['English', 'Math', 'Social Science', 'Science', 'Physical Education', 'Foreign Language', 'Computer Science', 'Miscellaneous'];

    const classes_ = data.srapi.findManyClass;

    return (
        <>
            <Helmet>
                <title>{ `${ splitSemester(semester) } Announcer` }</title>
                <meta name='description' content={ `See the classes offered at Lowell High School in San Francisco in ${ splitSemester(semester) }.` }/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Announcer', 'Class', 'Course', 'San Francisco', splitSemester(semester)] }/>
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
                <Typography variant='h4' align='center'>{ splitSemester(semester) } Announcer</Typography>
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
                                        removeDupes(classes_.filter(class_ => class_.department === department).map(class_ => class_.name).sort())
                                            .map((courseName, idx) => <TableSection key={ idx } header={ courseName } colSpan={ 3 } cellStyle={ { textAlign: 'left' } }>
                                                {
                                                    classes_.filter(class_ => class_.name === courseName).map((class_, idx) => (
                                                        <TableRow key={ idx }>
                                                            <TableCell style={ { width: '10%', textAlign: 'center' } }>{ class_.block }</TableCell>
                                                            <TableCell
                                                                onClick={ () => navigate(`/courses/${ slugify(class_.name, { lower: true }) }`) }
                                                                style={ { cursor: 'pointer', width: '45%', textAlign: 'center' } }
                                                            >
                                                                <Link to={ `/courses/${ slugify(class_.name, { lower: true }) }` }>{ class_.name }{ class_.section ? ` (${ class_.section })`: '' }</Link>
                                                            </TableCell>
                                                            <TableCell
                                                                onClick={ () => navigate(`/teachers/${ slugify(class_.teacher, { lower: true }) }`) }
                                                                style={ { cursor: 'pointer', width: '45%', textAlign: 'center' } }
                                                            >
                                                                <Link to={ `/teachers/${ slugify(class_.teacher, { lower: true }) }` }>{ class_.teacher }</Link>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                }
                                            </TableSection>)
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
