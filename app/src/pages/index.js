import React from 'react';
import { graphql } from 'gatsby';
import slugify from 'slugify';

export default ({ data }) => <div>{ Array.from(new Set(data.allMongodbStudentsReviewClasses.nodes.map(node => node.Teacher))).map((name, idx) =>
    <a key={ idx } href={ `/teachers/${ slugify(name, { lower: true }) }` } style={ { display: 'block' } } >{ name }</a>
) }</div>;

export const query = graphql`
        query {
            allMongodbStudentsReviewClasses {
                nodes {
                    Teacher
                }
            }
        }
    `
