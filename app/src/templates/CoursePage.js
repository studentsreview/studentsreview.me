import React from 'react';
import { graphql } from 'gatsby';
import { Paper, withStyles } from '@material-ui/core'
import Layout from '../components/layout';

import { card } from '../styles/styles';

const TeacherPage = ({ pageContext, data, classes }) => {
    const { name } = pageContext;

    const codes = Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Course_Code)));

    return <Layout gridStyle={ {
        minHeight: 'calc(70% - 64px)'
    } }>
        <Paper className={ classes.card }>
            <h3>{ name }</h3>
            <p>Course Code: { codes.join(', ') }</p>
            <p>Department: { data.allMongodbStudentsReviewClasses.nodes[0].Department }</p>
        </Paper>
    </Layout>;
}

export default withStyles({ card })(TeacherPage);

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Course_Name: {
                eq: $name
            }
        }) {
            nodes {
                Course_Name,
                Course_Code,
                Department
            }
        }
    }
`;
