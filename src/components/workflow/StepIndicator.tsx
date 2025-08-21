import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                step.number < currentStep
                  ? 'bg-green-500 border-green-500'
                  : step.number === currentStep
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white/10 border-white/30'
              }`}
            >
              {step.number < currentStep ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-6 w-6 text-white" />
                </motion.div>
              ) : (
                <span className={`font-semibold ${
                  step.number === currentStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.number}
                </span>
              )}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-2 text-sm font-medium ${
                step.number <= currentStep ? 'text-white' : 'text-gray-400'
              }`}
            >
              {step.title}
            </motion.p>
          </div>
          
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step.number < currentStep ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className={`h-0.5 w-16 mx-4 origin-left ${
                step.number < currentStep ? 'bg-green-500' : 'bg-white/30'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;