import React  from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { Link, graphql, useStaticQuery } from 'gatsby';
import Img from 'gatsby-image';

import '../styles/layout.css';

const AppHeader = () => {
    const data = useStaticQuery(graphql`
            query {
                file(relativePath: { eq: "logo_transparent.png" }) {
                    childImageSharp {
                        fixed(width: 100, height: 100) {
                            ...GatsbyImageSharpFixed
                        }
                    }
                }
            }
    `);

    return (
        <AppBar position='static'>
            <Toolbar>
                <Link to='/'><Img fixed={ data.file.childImageSharp.fixed }/></Link>
                <Link to='/' style={ { color: 'white' } }>Students Review</Link>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader;
