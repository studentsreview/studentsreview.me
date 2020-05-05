import React from 'react';
import { MenuItem, Select } from '@material-ui/core';

import { splitSemester } from '../utils';

const SemesterSelect = ({ semesters, value, onChange }) => (
    <Select
        value={ value }
        renderValue={ val => splitSemester(val) }
        onChange={ e => onChange(e.target.value) }
    >
        <MenuItem value={ value }>{ splitSemester(value) }</MenuItem>
        {
            semesters
                .slice(0, semesters.indexOf(value))
                .concat(semesters.slice(semesters.indexOf(value) + 1))
                .map((semester, idx) => <MenuItem value={ semester } key={ idx }>{ splitSemester(semester) }</MenuItem>)
        }
    </Select>
);

export default SemesterSelect;
