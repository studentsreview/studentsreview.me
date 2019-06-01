import React, { createElement } from 'react';
import Layout from '../layout'

const withRoot = component => props => (
    <Layout>
        { createElement(component, props) }
    </Layout>
);

export default withRoot;
