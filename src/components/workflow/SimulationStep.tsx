import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Square, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';

interface SimulationStepProps {
  onPrevious: () => void;
  metadata: any;
  dateRanges: any;
}

interface DataRow {
  id: string;
  timestamp: string;
  prediction: 'pass' | 'fail';
  confidence: number;
}

const SimulationStep: React.FC<SimulationStepProps> = ({
  onPrevious,
  metadata,
  dateRanges,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [dataRows, setDataRows] = useState<DataRow[]>([]);
  const [stats, setStats] = useState({
    totalProcessed: 0,
    passCount: 0,
    failCount: 0,
    avgConfidence: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Confidence Score',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        const newRow: DataRow = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          prediction: Math.random() > 0.3 ? 'pass' : 'fail',
          confidence: Math.random() * 30 + 70, // 70-100%
        };

        setDataRows(prev => {
          const updated = [newRow, ...prev].slice(0, 50); // Keep last 50 rows
          
          // Update stats
          const totalProcessed = updated.length;
          const passCount = updated.filter(row => row.prediction === 'pass').length;
          const failCount = totalProcessed - passCount;
          const avgConfidence = updated.reduce((sum, row) => sum + row.confidence, 0) / totalProcessed;
          
          setStats({
            totalProcessed,
            passCount,
            failCount,
            avgConfidence,
          });

          // Update chart data
          const labels = updated.slice(-20).reverse().map((_, i) => `${i + 1}`);
          const data = updated.slice(-20).reverse().map(row => row.confidence);
          
          setChartData({
            labels,
            datasets: [
              {
                label: 'Confidence Score',
                data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
              },
            ],
          });

          return updated;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const stopSimulation = () => {
    setIsRunning(false);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white' },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: 'white' },
        min: 60,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Real-Time Simulation</h2>
        <p className="text-gray-300 mb-6">
          Stream live predictions and monitor model performance
        </p>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Simulation Control</h3>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSimulation}
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-all duration-300 shadow-lg ${
                  isRunning
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopSimulation}
                className="inline-flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-gray-300">
              {isRunning ? 'Simulation running...' : 'Simulation stopped'}
            </span>
          </div>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <motion.p
              key={stats.totalProcessed}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-white"
            >
              {stats.totalProcessed}
            </motion.p>
            <p className="text-gray-300 text-sm">Total Processed</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <motion.p
              key={stats.passCount}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-green-400"
            >
              {stats.passCount}
            </motion.p>
            <p className="text-gray-300 text-sm">Pass</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <motion.p
              key={stats.failCount}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-red-400"
            >
              {stats.failCount}
            </motion.p>
            <p className="text-gray-300 text-sm">Fail</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
            <motion.p
              key={stats.avgConfidence}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-blue-400"
            >
              {stats.avgConfidence.toFixed(1)}%
            </motion.p>
            <p className="text-gray-300 text-sm">Avg Confidence</p>
          </div>
        </motion.div>

        {/* Chart and Data Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Live Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Live Confidence Scores</h3>
            <Line data={chartData} options={chartOptions} />
          </motion.div>

          {/* Data Stream */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Live Data Stream</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              <AnimatePresence>
                {dataRows.map((row, index) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded-full ${
                        row.prediction === 'pass' ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {row.prediction === 'pass' ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <XCircle className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">#{row.id}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(row.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        row.prediction === 'pass' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {row.prediction.toUpperCase()}
                      </p>
                      <p className="text-gray-300 text-sm">{row.confidence.toFixed(1)}%</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Export Results
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SimulationStep;