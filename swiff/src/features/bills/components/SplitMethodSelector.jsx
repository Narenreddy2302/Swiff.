import PropTypes from 'prop-types';

const SplitMethodSelector = ({ selectedMethod, onMethodChange }) => {
  const methods = [
    {
      value: 'equal',
      label: 'Split Equally',
      description: 'Divide the total amount equally among all participants',
      icon: '⚖️',
    },
    {
      value: 'custom',
      label: 'Custom Amounts',
      description: 'Enter a specific amount for each person',
      icon: '✏️',
    },
    {
      value: 'percentage',
      label: 'By Percentage',
      description: 'Assign a percentage of the total to each person',
      icon: '%',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">How to split?</h4>

      <div className="space-y-2">
        {methods.map((method) => (
          <label
            key={method.value}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === method.value
                ? 'border-accent-red bg-red-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="splitMethod"
              value={method.value}
              checked={selectedMethod === method.value}
              onChange={(e) => onMethodChange(e.target.value)}
              className="mt-1 w-4 h-4 text-accent-red border-gray-300 focus:ring-accent-red"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{method.icon}</span>
                <span className="font-medium text-gray-900">{method.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{method.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

SplitMethodSelector.propTypes = {
  selectedMethod: PropTypes.oneOf(['equal', 'custom', 'percentage']).isRequired,
  onMethodChange: PropTypes.func.isRequired,
};

export default SplitMethodSelector;
