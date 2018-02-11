import React from 'react';
import '../../styles/index.css';

const Spinner = ({ borderColor, borderColorTop }) => {
    const styles = {
        border: `7px solid ${borderColor}`,
        borderTop: `7px solid ${borderColorTop}`
    };
    
    return (
        <div className="loading-spinner">
            <span style={styles}></span>
        </div>    
    );
};

export default Spinner;