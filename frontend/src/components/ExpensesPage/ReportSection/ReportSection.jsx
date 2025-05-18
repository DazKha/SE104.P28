import React from 'react';
import PropTypes from 'prop-types';
import ExpenseChart from '../ExpenseChart/ExpenseChart.jsx';

const ReportSection = ({ data }) => {
  return (
    <div className="report-section bg-gray-800 rounded-lg p-6">
      <h2 className="text-white text-xl font-medium mb-4">Report</h2>
      <div className="chart-container flex justify-center items-center h-64">
        <ExpenseChart data={data} />
      </div>
      
      {/* Legend */}
      <div className="legend flex justify-center mt-6 space-x-6">
        {data.map((item) => (
          <div key={item.name} className="flex items-center">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-white">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

ReportSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired
    })
  ).isRequired
};

export default ReportSection;