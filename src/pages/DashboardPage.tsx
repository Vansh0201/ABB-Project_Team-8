import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, BarChart3, Clock, FileText, Plus, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

interface Dataset {
  id: string;
  name: string;
  size: number;
  columns: number;
  records: number;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'completed';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/datasets');
      setDatasets(response.data);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: FileText,
      label: "Total Datasets",
      value: datasets.length,
      color: "blue",
    },
    {
      icon: BarChart3,
      label: "Processed",
      value: datasets.filter(d => d.status === 'completed').length,
      color: "green",
    },
    {
      icon: Clock,
      label: "Processing",
      value: datasets.filter(d => d.status === 'processing').length,
      color: "yellow",
    },
    {
      icon: Upload,
      label: "Uploaded",
      value: datasets.filter(d => d.status === 'uploaded').length,
      color: "purple",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-300">Manage your datasets and workflows</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-bold text-white"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-400`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <Upload className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Start New Workflow</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Upload a new dataset and begin the data processing workflow
              </p>
              <Link to="/workflow">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <Play className="h-8 w-8 text-green-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">Quick Simulation</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Run a simulation on your existing datasets
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors shadow-lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Simulation
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Recent Datasets */}
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20"
          >
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-semibold text-white">Recent Datasets</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                  />
                </div>
              ) : datasets.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">No datasets uploaded yet</p>
                  <Link to="/workflow">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Upload Your First Dataset
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {datasets.map((dataset, index) => (
                    <motion.div
                      key={dataset.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{dataset.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {dataset.records} records • {dataset.columns} columns
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dataset.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : dataset.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {dataset.status}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Play className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;