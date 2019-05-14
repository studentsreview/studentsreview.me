import React from 'react';
import { graphql } from 'gatsby';
import { Paper, withStyles } from '@material-ui/core';
import Layout from '../components/layout';

import { card } from '../styles/styles';

const TeacherPage = ({ pageContext, data, classes }) => {
    const { name } = pageContext;

    const departments = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Department)));

    if (departments.includes('Miscellaneous') && departments.length > 1) {
        departments.splice(departments.indexOf('Miscellaneous'), 1);
    }

    return <Layout gridStyle={ {
        minHeight: '70%'
    } }>
        <Paper className={ classes.card }>
            <h3>{ name }</h3>
            <p>{ departments.join(', ') } Teacher</p>
        </Paper>
    </Layout>;
}

export default withStyles({ card })(TeacherPage);

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Teacher: {
                eq: $name
            }
        }) {
            nodes {
                Department
            }
        }
    }
`;
