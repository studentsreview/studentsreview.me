import React from 'react';
import withRoot from '../components/hoc/withRoot';

const NotFoundPage = () => <div style={ {
    minHeight: '70%',
    textAlign: 'center'
} }>
    <h3>Are You Lost?</h3>
</div>;

export default withRoot(NotFoundPage);
