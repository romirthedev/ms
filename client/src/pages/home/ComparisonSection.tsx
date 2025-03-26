import React from 'react';

const comparisonData = [
  {
    feature: 'Data Sources',
    traditional: 'Financial statements, Market data',
    stockSense: 'Financial data + 10,000+ news sources + social media + patents + research papers',
  },
  {
    feature: 'Analysis Speed',
    traditional: 'Days to weeks',
    stockSense: 'Real-time (milliseconds)',
  },
  {
    feature: 'Prediction Basis',
    traditional: 'Historical patterns, Technical indicators',
    stockSense: 'Forward-looking events, breakthroughs, and developments',
  },
  {
    feature: 'Competitor Impact Analysis',
    traditional: 'Limited, manual research required',
    stockSense: 'Automated impact analysis across industry ecosystems',
  },
  {
    feature: 'Learning Capability',
    traditional: 'Static formulas and models',
    stockSense: 'Self-improving AI that enhances accuracy over time',
  },
];

const ComparisonSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">How We Compare</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            See how StockSense AI stacks up against traditional stock analysis methods.
          </p>
        </div>

        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Traditional Analysis
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                    StockSense AI
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.traditional}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        <i className="fa-solid fa-check text-green-500 mr-2"></i>
                        {row.stockSense}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
