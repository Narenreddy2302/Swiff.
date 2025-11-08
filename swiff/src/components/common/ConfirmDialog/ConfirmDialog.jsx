import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import Button from '../Button/Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full"
            >
              {title && (
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
              )}

              {message && <p className="text-gray-600 mb-6">{message}</p>}

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                  {cancelText}
                </Button>
                <Button
                  variant={confirmVariant}
                  onClick={onConfirm}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  isLoading: PropTypes.bool,
};

export default ConfirmDialog;
