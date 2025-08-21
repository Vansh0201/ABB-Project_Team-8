import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import UploadStep from '../components/workflow/UploadStep';
import DateRangeStep from '../components/workflow/DateRangeStep';
import TrainingStep from '../components/workflow/TrainingStep';
import SimulationStep from '../components/workflow/SimulationStep';
import StepIndicator from '../components/workflow/StepIndicator';

const WorkflowPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [dateRanges, setDateRanges] = useState<any>(null);

  const steps = [
    { number: 1, title: 'Upload Dataset', component: UploadStep },
    { number: 2, title: 'Define Date Ranges', component: DateRangeStep },
    { number: 3, title: 'Model Training', component: TrainingStep },
    { number: 4, title: 'Real-Time Simulation', component: SimulationStep },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStep
            onNext={handleNext}
            onFileUpload={setUploadedFile}
            onMetadata={setMetadata}
            uploadedFile={uploadedFile}
            metadata={metadata}
          />
        );
      case 2:
        return (
          <DateRangeStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDateRanges={setDateRanges}
            dateRanges={dateRanges}
            metadata={metadata}
          />
        );
      case 3:
        return (
          <TrainingStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            metadata={metadata}
          />
        );
      case 4:
        return (
          <SimulationStep
            onPrevious={handlePrevious}
            metadata={metadata}
            dateRanges={dateRanges}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">Data Processing Workflow</h1>
            <p className="text-gray-300">Follow the steps to process your dataset</p>
          </motion.div>

          <StepIndicator currentStep={currentStep} steps={steps} />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              {getCurrentStepComponent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;