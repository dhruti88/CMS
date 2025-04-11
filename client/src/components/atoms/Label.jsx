import React from 'react';

const Label = ({ children, sx = {} }) => <label sx={{
    ...sx,
}}>{children}</label>;

export default Label;
