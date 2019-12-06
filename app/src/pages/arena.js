import React, { useState } from 'react';
import { ClickAwayListener, Grid, Paper } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import Helmet from 'react-helmet';
import Course from '../components/arena/Course';
import StudentVueLoginForm from '../components/arena/StudentVueLoginForm';
import Modal from '../components/Modal';

import { graphql } from 'gatsby';
import { withStyles } from '@material-ui/styles';
import { removeDupes, getCurrentSemester, sortSemesters } from '../utils'

import styles from '../styles/styles';

const PopUp = withStyles(styles)(({ classes, onLogin }) => {
    const [modalExposed, setModalExposed] = useState(true);

    return (
        <Modal shown={ modalExposed }>
            <Grid item xs={ 12 } sm={ 6 }>
                <ClickAwayListener onClickAway={ () => setModalExposed(false) }>
                    <Paper className={ classes.control }>
                        <Close onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }/>
                        <StudentVueLoginForm
                            onLogin={ data => {
                                onLogin(data);
                                setModalExposed(false);
                            } }
                            onClose={ () => setModalExposed(false) }
                        />
                    </Paper>
                </ClickAwayListener>
            </Grid>
        </Modal>
    );
});

const ArenaPage = ({ classes, data }) => {
    const departments = removeDupes(data.srapi.findManyCourse.map(course => course.department));
    const [importedClasses, setImportedClasses] = useState([]);

    const lastClasses = data.srapi.findManyClass.filter(class_ => class_.semester === getCurrentSemester());
    const currentClasses = data.srapi.findManyClass.filter(class_ => class_.semester === sortSemesters(data.site.siteMetadata.announcers)[0]);

    return (
        <>
            <Helmet>
                <title>Arena</title>
                <meta name='description' content='Generate Arena Schedules'/>
                <meta name='keywords' content={ ['Education', 'Lowell High School', 'Lowell Arena'].join(',') }/>
            </Helmet>
            <div className={ classes.root }>
                <Grid container spacing={ 3 } direction='column' alignItems='center'>
                    <PopUp
                        onLogin={ schedule => setImportedClasses(
                            schedule
                                .map(importedCourse => lastClasses
                                    .find(class_ => class_.teacher === importedCourse.teacher && class_.block === String(importedCourse.block))
                                )
                                .filter(importedCourse => importedCourse)
                        ) }
                    />
                    <Grid item xs={ 12 } sm={ 6 }>
                        { importedClasses.map((importedClass, idx) => <Paper key={ idx } className={ [classes.control, classes.root] }>
                            <Course
                                id={ 0 }
                                courses={ data.srapi.findManyCourse }
                                classes={ currentClasses }
                                departments={ departments }
                                initialClass={ importedClass }
                            />
                        </Paper>) }
                    </Grid>
                </Grid>
            </div>
        </>
    );
};

export const query = graphql`
    query {
        site {
            siteMetadata {
                announcers
            }
        }
        srapi {
            findManyCourse(
                filter: {
                    OR: [
                        { _operators: { semesters: { in: "Spring2020" } } }
                        { _operators: { semesters: { in: "Fall2019" } } }
                    ]
                }
            ) {
                name
                department
                sectioned
            }
            findManyClass(
                filter: {
                    OR: [
                        { semester: "Spring2020" }
                        { semester: "Fall2019" }
                    ]
                }
            ) {
                name
                teacher
                block
                section
                semester
            }
        }
    }
`;

export default withStyles(styles)(ArenaPage);
