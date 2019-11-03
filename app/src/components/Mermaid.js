import React, { useEffect } from 'react';

import mermaid from 'mermaid';

const Mermaid = ({ chart, onClick }) => {
    useEffect(() => {
        mermaid.contentLoaded();
        for (let [key, value] of Object.entries(onClick)) {
            let el = document.getElementById(key);
            if (el !== null) {
                el.addEventListener('click', () => value(key));
                if (!el.classList.contains('clickable')) {
                    el.classList.add('clickable');
                }
            }
        }
    }, [chart, onClick]);

    return (
        <div className='mermaid'>{ chart }</div>
    )
};

export default Mermaid;
