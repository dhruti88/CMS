import React from 'react';

const Input = ({ type = 'text', value, onChange, min, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    min={min}
    placeholder={placeholder}
  />
);

export default Input;
