import React from 'react';
import { MenuItem, Select } from '@material-ui/core';

const SemesterSelect = ({ semesters, value, onChange }) => (
    <Select value={ value }
            renderValue={ val => <MenuItem>{ /(Spring|Fall)(\d{4})/.exec(val).slice(1).join(' ') }</MenuItem> }
            onChange={ e => onChange(e.target.value) }
    >
        <MenuItem value={ value }>{ /(Spring|Fall)(\d{4})/.exec(value).slice(1).join(' ') }</MenuItem>
        {
            semesters
                .slice(0, semesters.indexOf(value))
                .concat(semesters.slice(semesters.indexOf(value) + 1))
                .map((semester, idx) => <MenuItem
                    value={ semester }
                    key={ idx }
                >
                    { /(Spring|Fall)(\d{4})/.exec(semester).slice(1).join(' ') }
                </MenuItem>)
        }
    </Select>
);

export default SemesterSelect;
