import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded transition-all duration-base cursor-pointer inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-[#E82127] text-white hover:bg-[#C41E24] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'border-2 border-gray-800 text-gray-800 bg-white hover:bg-gray-100 active:scale-95 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed',
    ghost: 'text-gray-800 hover:text-[#E82127] hover:underline disabled:text-gray-300 disabled:cursor-not-allowed',
    danger: 'bg-[#DC3545] text-white hover:bg-[#C82333] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed',
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClasses}
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;
