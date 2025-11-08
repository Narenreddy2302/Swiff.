import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helperText,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'px-4 py-3 border-b-2 transition-colors duration-base focus:outline-none bg-white text-gray-900 placeholder-gray-400';
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClasses = error
      ? 'border-status-danger text-status-danger'
      : 'border-gray-300 focus:border-accent-blue';
    const combinedClasses = `${baseClasses} ${widthClass} ${errorClasses} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-800 mb-2">
            {label}
          </label>
        )}
        <input ref={ref} type={type} className={combinedClasses} {...props} />
        {error && helperText && (
          <p className="mt-2 text-sm text-status-danger">{helperText}</p>
        )}
        {!error && helperText && (
          <p className="mt-2 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
