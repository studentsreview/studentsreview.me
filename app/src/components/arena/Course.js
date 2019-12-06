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

const Course = ({ id, initialClass, courses, classes, departments }) => {
    const [selectedDepartment, setSelectedDepartment] = useState(initialClass ? courses.find(course => course.name === initialClass.name).department : '');
    const [selectedCourse, setSelectedCourse] = useState(initialClass ? courses.find(course => course.name === initialClass.name) : '');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('Any');
    const [selectedBlock, setSelectedBlock] = useState('Any');

    const selects = [];

    selects.push(<LabeledSelect
        type='department'
        label='Department'
        id={ id }
        value={ selectedDepartment }
        onChange={ e => {
            setSelectedDepartment(e.target.value);
            setSelectedCourse('');
            setSelectedSection('');
            setSelectedTeacher('Any');
            setSelectedBlock('Any');
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
                setSelectedTeacher('Any');
                setSelectedBlock('Any');
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
                        setSelectedTeacher('Any');
                        setSelectedBlock('Any');
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
        selects.push(<div>
            <LabeledSelect
                type='teacher'
                label='Teacher'
                id={ id }
                value={ selectedTeacher }
                onChange={ e => {
                    setSelectedTeacher(e.target.value);
                    if (!classes.find(class_ => class_.teacher === e.target.value && class_.block === selectedBlock)) {
                        setSelectedBlock('Any');
                    }
                } }
            >
                <MenuItem value='Any'>Any</MenuItem>
                { removeDupes(classes
                    .filter(class_ => class_.name === selectedCourse.name &&
                        (!selectedCourse.sectioned || class_.section === selectedSection)
                    ).map(class_ => class_.teacher)).map((teacher, idx) =>
                    <MenuItem key={ idx } value={ teacher }>
                        { teacher }
                    </MenuItem>
                ) }
            </LabeledSelect>
            <LabeledSelect
                type='block'
                label='Block'
                id={ id }
                value={ selectedBlock }
                onChange={ e => setSelectedBlock(e.target.value) }
            >
                <MenuItem value='Any'>Any</MenuItem>
                { removeDupes(classes
                    .filter(class_ => class_.name === selectedCourse.name &&
                        (!selectedCourse.sectioned || class_.section === selectedSection) &&
                        (selectedTeacher === 'Any' || class_.teacher === selectedTeacher)
                    ).map(class_ => class_.block)).map((block, idx) =>
                    <MenuItem key={ idx } value={ block }>
                        { block }
                    </MenuItem>
                ) }
            </LabeledSelect>
        </div>);
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

