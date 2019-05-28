import React  from 'react';

const Modal = ({ shown, children }) => (
    shown ? <div style={ {
        position: 'fixed',
        zIndex: 1,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    } }><div style={ {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    } }>
        { children }
    </div></div>: null
);

export default Modal;
