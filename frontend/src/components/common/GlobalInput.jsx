import React from 'react';

const GlobalInput = React.forwardRef(({ onChange, onBlur, value, ...props }, ref) => {
  const handleChange = (e) => {
    let val = e.target.value;

    // 1. Prevent leading space
    if (val.startsWith(' ')) {
      val = val.trimStart();
    }

    // 2. Sanitize scripting language HTML tags (strip < and >)
    val = val.replace(/[<>]/g, '');

    if (onChange) {
      // Create a synthetic event or modify the target value
      e.target.value = val;
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    let val = e.target.value;

    // Trim trailing space on blur (to ensure payload has trimmed value)
    val = val.trim();

    if (onChange && e.target.value !== val) {
      e.target.value = val;
      onChange(e);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      ref={ref}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
});

GlobalInput.displayName = 'GlobalInput';

export default GlobalInput;
