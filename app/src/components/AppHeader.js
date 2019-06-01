import React  from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { Link, graphql, useStaticQuery } from 'gatsby';
import Img from 'gatsby-image';

import '../styles/layout.css';

const AppHeader = ({ theme }) => {
    const data = useStaticQuery(graphql`
            query {
                file(relativePath: { eq: "logo_transparent.png" }) {
                    childImageSharp {
                        fixed(width: 75, height: 75) {
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
                <Link to='/' style={ { color: theme.palette.primary.contrastText, margin: theme.spacing(1) } }>Students Review</Link>
            </Toolbar>
        </AppBar>
    );
};

export default withTheme(AppHeader);
