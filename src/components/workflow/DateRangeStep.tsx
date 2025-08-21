import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface DateRangeStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onDateRanges: (ranges: any) => void;
  dateRanges: any;
  metadata: any;
}

const DateRangeStep: React.FC<DateRangeStepProps> = ({
  onNext,
  onPrevious,
  onDateRanges,
  dateRanges,
  metadata,
}) => {
  const [ranges, setRanges] = useState({
    training: { start: '2025-01-01', end: '2025-06-30' },
    testing: { start: '2025-07-01', end: '2025-09-30' },
    simulation: { start: '2025-10-01', end: '2025-12-31' },
  });

  const [validation, setValidation] = useState({
    training: 'valid',
    testing: 'valid',
    simulation: 'valid',
  });

  const handleRangeChange = (type: string, field: string, value: string) => {
    const newRanges = {
      ...ranges,
      [type]: {
        ...ranges[type as keyof typeof ranges],
        [field]: value,
      },
    };
    setRanges(newRanges);
    onDateRanges(newRanges);
  };

  const cards = [
    {
      title: 'Training Period',
      description: 'Data used to train the model',
      type: 'training',
      color: 'blue',
      icon: Calendar,
    },
    {
      title: 'Testing Period',
      description: 'Data used to validate model performance',
      type: 'testing',
      color: 'green',
      icon: Calendar,
    },
    {
      title: 'Simulation Period',
      description: 'Data for real-time simulation',
      type: 'simulation',
      color: 'purple',
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Define Date Ranges</h2>
        <p className="text-gray-300 mb-6">
          Set the date ranges for training, testing, and simulation phases
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-${card.color}-400/50 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 bg-${card.color}-500/20 rounded-lg mr-3`}>
                    <card.icon className={`h-5 w-5 text-${card.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="text-gray-400 text-sm">{card.description}</p>
                  </div>
                </div>
                <div className={`${
                  validation[card.type as keyof typeof validation] === 'valid'
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}>
                  {validation[card.type as keyof typeof validation] === 'valid' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={ranges[card.type as keyof typeof ranges].start}
                    onChange={(e) => handleRangeChange(card.type, 'start', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={ranges[card.type as keyof typeof ranges].end}
                    onChange={(e) => handleRangeChange(card.type, 'end', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Timeline Overview</h3>
          <div className="relative h-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-green-500/30 to-purple-500/30 rounded-lg" />
            <div className="absolute inset-0 flex items-center px-4">
              <div className="flex-1 text-center">
                <p className="text-blue-400 font-medium text-sm">Training</p>
                <p className="text-white text-xs">{ranges.training.start} - {ranges.training.end}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-green-400 font-medium text-sm">Testing</p>
                <p className="text-white text-xs">{ranges.testing.start} - {ranges.testing.end}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-purple-400 font-medium text-sm">Simulation</p>
                <p className="text-white text-xs">{ranges.simulation.start} - {ranges.simulation.end}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrevious}
            className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Continue to Training
            <ArrowRight className="h-4 w-4 ml-2" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DateRangeStep;