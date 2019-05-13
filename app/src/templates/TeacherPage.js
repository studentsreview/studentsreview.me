import React from 'react';
import { graphql } from 'gatsby';
import { Paper } from '@material-ui/core';

const TeacherPage = ({ pageContext, data }) => {
    const { name } = pageContext;

    return <Paper>
        <h1>{ name }</h1>
        { data.allMongodbStudentsReviewClasses.nodes.map((node, idx) => <p key={ idx }>
            { node.Course_Name } - { node.Course_Code }
        </p>) }
    </Paper>;
}

export default TeacherPage;

export const query = graphql`
    query($name: String!) {
        allMongodbStudentsReviewClasses(filter: {
            Teacher: {
                eq: $name
            }
        }) {
            nodes {
                Course_Name,
                Course_Code
            }
        }
    }
`;
