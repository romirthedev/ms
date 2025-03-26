import React from 'react';

const statsData = [
  { value: '93%', label: 'Prediction Accuracy' },
  { value: '5,000+', label: 'Active Users' },
  { value: '10k+', label: 'Daily News Sources' },
  { value: '27%', label: 'Avg. Higher Returns' },
];

const StatsSection = () => {
  return (
    <section className="bg-white py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
