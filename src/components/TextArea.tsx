'use client';
import React from 'react';

interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  className?: string;
  'aria-label'?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange, placeholder, className = '', 'aria-label': ariaLabel }) => {
  return (
    <textarea
      className={`w-full h-full p-2 border rounded bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
};

export default TextArea;