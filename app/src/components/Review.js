import React, { useEffect, useState, useRef } from 'react';
import {
    ClickAwayListener,
    IconButton,
    Paper,
    MenuItem,
    Popper,
    Typography,
    Grid,
} from '@material-ui/core'
import { useTheme, withStyles } from '@material-ui/styles';
import { Close, MoreVert } from '@material-ui/icons'
import StarRatings from 'react-star-ratings';
import Modal from '../components/Modal';
import ReportForm from '../components/ReportForm';

import moment from 'moment';
import slugify from 'slugify';
import { hashReview, isMigrant, copyToClipboard } from '../utils';

import styles from '../styles/styles';

const Review = ({ classes, review, teacher, selected, onClick }) => {
    const anchorEl = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalExposed, setModalExposed] = useState(false);

    const truncateLength = 500;
    const fullText = review.text.replace(/Submitted by a student$/, '').replace(/Submitted by a Parent$/, '');
    const [shownText, setShownText] = useState(fullText.slice(0, truncateLength + 1));

    if (!fullText.includes(shownText)) {
        setShownText(fullText.slice(0, truncateLength + 1));
    }

    useEffect(() => {
        if (selected) {
            anchorEl.current.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }, []);

    const theme = useTheme();

    return (
        <div className={ classes.control } style={ {
            wordWrap: 'break-word',
            background: selected ? 'rgba(0, 0, 0, 0.14)' : 'inherit'
        } }>
            <IconButton style={ {
                float: 'right'
            } }
                buttonRef={ anchorEl }
                onClick={ () => setMenuOpen(!menuOpen) }
            >
                <MoreVert fontSize='small'/>
            </IconButton>
            <Popper
                anchorEl={ anchorEl.current }
                open={ menuOpen }
                onBlur={ () => setMenuOpen(false) }
            >
                <ClickAwayListener onClickAway={ () => setMenuOpen(false) }>
                    <Paper style={ {
                        padding: theme.spacing(1),
                        width: 200
                    } } onClick={ () => setMenuOpen(false) }>
                        <MenuItem onClick={ e => copyToClipboard(e.target, `${ window.location.origin }/teachers/${ slugify(teacher, { lower: true }) }#${ hashReview(review, teacher) }`) }>
                            Copy Link
                        </MenuItem>
                        <MenuItem onClick={ () => setModalExposed(true) }>
                            Report
                        </MenuItem>
                    </Paper>
                </ClickAwayListener>
            </Popper>
            <div
                style={ { cursor: typeof onClick === 'function' ? 'pointer' : null } }
                onClick={ () => typeof onClick === 'function' ? onClick() : null }
            >
                {
                    !isMigrant(review) ? <>
                        <StarRatings
                            rating={ review.rating }
                            starRatedColor='gold'
                            starHoverColor='gold'
                            numberOfStars={ 5 }
                            starDimension={ theme.spacing(2.5) }
                            starSpacing={ theme.spacing(0.25) }
                        />
                        <Typography variant='caption' style={ {
                            marginLeft: theme.spacing(0.5)
                        } }>{ moment(review.timestamp).format('MMM Do YYYY') }</Typography>
                    </> : <Typography variant='caption'>Restored from ratemyteachers.com</Typography>
                }
                <Typography variant='body1'>
                    { shownText }{ shownText.length < fullText.length ? '…' : '' }
                </Typography>
            </div>
            <Typography variant='body1'>
                { shownText.length < fullText.length ?
                    <p onClick={ () => setShownText(fullText) } style={ { margin: 0, color: theme.palette.secondary.dark, cursor: 'pointer' } }>Expand</p> : (
                        shownText.length > truncateLength ? <p onClick={ () => setShownText(fullText.slice(0, truncateLength + 1)) } style={ { margin: 0, color: theme.palette.secondary.dark, cursor: 'pointer' } }>Collapse</p> : null
                    ) }
            </Typography>
            <Modal shown={ modalExposed }>
                <Grid item xs={ 12 } sm={ 6 }>
                    <ClickAwayListener onClickAway={ () => setModalExposed(false) }>
                        <Paper className={ classes.control }>
                            <Close onClick={ () => setModalExposed(false) } style={ { cursor: 'pointer', float: 'right' } }/>
                            <ReportForm review={ review } teacher={ teacher } onClose={ () => setModalExposed(false) }/>
                        </Paper>
                    </ClickAwayListener>
                </Grid>
            </Modal>
        </div>
    );
}

export default withStyles(styles)(Review);
