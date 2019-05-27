import React from 'react';
import { Chip } from '@material-ui/core'

const DepartmentChip = ({ department }) => <Chip
    style={ {
        marginTop: 5,
        background: {
            Science: 'lightgreen',
            Math: 'lightblue',
            'Computer Science': 'orange',
            English: '#e0e0e0',
            'Physical Education': 'pink',
            JROTC: '#b5651d',
            'Visual Performing Arts': 'beige',
            'Social Science': 'gold',
            'Foreign Language': '#e6e6fa'
        }[department]
    } }
    label={ department }
/>;

export default DepartmentChip;
