import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const Card = ({
  children,
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-card p-6 transition-shadow duration-base';
  const hoverClasses = hoverable ? 'hover:shadow-card-hover cursor-pointer' : '';
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`;

  const cardContent = (
    <div className={combinedClasses} onClick={onClick} {...props}>
      {children}
    </div>
  );

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hoverable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
