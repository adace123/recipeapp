import React from 'react';
import '../../styles/button.css';

const Button = ({text, borderColor, hoverColor, onClick}) => {
    const styles = {
        border: `2px solid ${borderColor}`,
        color: borderColor,
        width: 75,
        display: 'inline-block'
    }
    
    const onMouseOver = e => {
        e.target.style.backgroundColor = hoverColor;
        e.target.style.color = borderColor === "white" ? 'black' : "white";
    }
    
    const onMouseOut = e => {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.color = borderColor;
    }

    return (
        <span className="btn" onMouseEnter={onMouseOver} onMouseOut={onMouseOut} style={styles} onClick={onClick}>{text}</span>    
    );
}

export default Button;