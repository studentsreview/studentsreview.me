import React, { useEffect, useState, useRef } from 'react';

import mermaid from 'mermaid';

const Mermaid = ({ content, onClick }) => {
    const graphRef = useRef(null);
    const [graph, setGraph] = useState('Loading...');

    useEffect(() => {
        mermaid.mermaidAPI.initialize({
            startOnLoad: false,
        });
        mermaid.mermaidAPI.render(
            Math.random().toString(36).substring(7).replace(/\d/, 'a'),
            content,
            setGraph
        );
    }, []);

    useEffect(() => {
        for (let [key, value] of Object.entries(onClick)) {
            let el = document.getElementById(key);
            if (el !== null) {
                el.addEventListener('click', () => value(key));
                el.classList.add('clickable');
            }
        }
    });

    return (
        <div className='mermaid' dangerouslySetInnerHTML={ { __html: graph } }/>
    );
};

export default Mermaid;
