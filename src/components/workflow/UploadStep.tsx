import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface UploadStepProps {
  onNext: () => void;
  onFileUpload: (file: File) => void;
  onMetadata: (metadata: any) => void;
  uploadedFile: File | null;
  metadata: any;
}

const UploadStep: React.FC<UploadStepProps> = ({
  onNext,
  onFileUpload,
  onMetadata,
  uploadedFile,
  metadata,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type === 'text/csv') {
      setUploading(true);
      onFileUpload(file);
      
      // Upload file and get metadata
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onMetadata(response.data);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  }, [onFileUpload, onMetadata]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setUploading(true);
      onFileUpload(file);
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await axios.post('http://localhost:3001/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onMetadata(response.data);
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Upload Your Dataset</h2>
        <p className="text-gray-300 mb-6">
          Upload a CSV file to begin the data processing workflow
        </p>

        {/* Upload Area */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-blue-400 bg-blue-500/20'
              : uploadedFile
              ? 'border-green-400 bg-green-500/20'
              : 'border-white/30 bg-white/5 hover:border-blue-400/50 hover:bg-white/10'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto"
              />
              <p className="text-white font-medium">Uploading and analyzing...</p>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="space-y-4"
            >
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
              <div>
                <p className="text-white font-medium text-lg">{uploadedFile.name}</p>
                <p className="text-gray-300">File uploaded successfully</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              animate={{ y: isDragOver ? -5 : 0 }}
              className="space-y-4"
            >
              <Upload className="h-16 w-16 text-blue-400 mx-auto" />
              <div>
                <p className="text-white font-medium text-lg">
                  Drag and drop your CSV file here
                </p>
                <p className="text-gray-300">or click to browse</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Metadata Display */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-400" />
              Dataset Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{metadata.records}</p>
                <p className="text-gray-300 text-sm">Records</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-white">{metadata.columns}</p>
                <p className="text-gray-300 text-sm">Columns</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-green-400">{metadata.passRate}%</p>
                <p className="text-gray-300 text-sm">Pass Rate</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{metadata.dateRange}</p>
                <p className="text-gray-300 text-sm">Date Range</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-end mt-8">
          {uploadedFile && metadata && (
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue to Date Ranges
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UploadStep;