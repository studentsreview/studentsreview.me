import React, { useState } from 'react';
import { Grid, InputLabel, FormControl, MenuItem, Select } from '@material-ui/core';

import { removeDupes } from '../../utils';
import { createStyles, withStyles } from '@material-ui/styles';

const styles = createStyles({
    select: {
        minWidth: 200,
        margin: 5
    }
});

const LabeledSelect = withStyles(styles)((props) => {
    const { classes, type, label, children, id } = props;

    return (
        <FormControl>
            <InputLabel id={ type + '-select-label-' + id }>{ label }</InputLabel>
            <Select
                className={ classes.select }
                labelId={ type + '-select-label-' + id }
                id={ type + '-select-' + id }
                { ...props }
            >
                { children }
            </Select>
        </FormControl>
    );
});

const Course = ({ id, courses, classes, departments }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);

    const selects = [];

    selects.push(<LabeledSelect
        type='department'
        label='Department'
        id={ id }
        value={ selectedDepartment }
        onChange={ e => {
            setSelectedDepartment(e.target.value);
            setSelectedCourse(null);
            setSelectedSection('');
            setSelectedClass(null);
        } }
    >
        { departments.map((department, idx) => <MenuItem key={ idx } value={ department }>
            { department }
        </MenuItem>) }
    </LabeledSelect>);

    if (selectedDepartment) {
        const courseSelect = <LabeledSelect
            type='course'
            label='Course'
            id={ id }
            value={ selectedCourse }
            onChange={ e => {
                setSelectedCourse(e.target.value);
                setSelectedSection('');
                setSelectedClass(null);
            } }
        >
            { courses.filter(course => course.department === selectedDepartment).map((course, idx) => <MenuItem key={ idx } value={ course }>
                { course.name }
            </MenuItem>) }
        </LabeledSelect>;
        if (selectedCourse && selectedCourse.sectioned) {
            selects.push(<div>
                { courseSelect }
                <LabeledSelect
                    type='section'
                    label='Section'
                    id={ id }
                    value={ selectedSection }
                    onChange={ e => {
                        setSelectedSection(e.target.value);
                        setSelectedClass(null);
                    } }
                >
                    { removeDupes(classes.filter(class_ => class_.name === selectedCourse.name).map(class_ => class_.section)).map((section, idx) => (
                        <MenuItem key={ idx } value={ section }>
                            { section }
                        </MenuItem>
                    )) }
                </LabeledSelect>
            </div>);
        } else {
            selects.push(courseSelect);
        }
    }

    if (selectedCourse && (selectedSection || !selectedCourse.sectioned)) {
        selects.push(<LabeledSelect
            type='teacher-block'
            label='Teacher / Block'
            id={ id }
            value={ selectedClass }
            onChange={ e => setSelectedClass(e.target.value) }
        >
            { classes.filter(class_ => class_.name === selectedCourse.name).map((class_, idx) => <MenuItem key={ idx } value={ class_ }>
                { class_.teacher } - Block { class_.block }
            </MenuItem>) }
        </LabeledSelect>);
    }

    return (
        <Grid container direction='column'>
            { selects.map((select, idx) => <div key={ idx }>
                { select }
            </div>) }
        </Grid>
    );
};

export default Course;

