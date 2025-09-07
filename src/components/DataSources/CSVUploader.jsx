import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';

export default function CSVUploader({ onClose }) {
  const { dispatch } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [dataSourceName, setDataSourceName] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setDataSourceName(selectedFile.name.replace('.csv', ''));
    parseCSV(selectedFile);
  };

  const parseCSV = (file) => {
    setParsing(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file');
          console.error('CSV parsing errors:', results.errors);
          setParsing(false);
          return;
        }

        const data = results.data;
        const columns = Object.keys(data[0] || {});
        
        setParsedData({
          data: data.slice(0, 100), // Preview first 100 rows
          totalRows: data.length,
          columns
        });
        
        setSelectedColumns(columns); // Select all columns by default
        setParsing(false);
        toast.success(`Parsed ${data.length} rows successfully`);
      },
      error: (error) => {
        toast.error('Failed to parse CSV file');
        console.error('CSV parsing error:', error);
        setParsing(false);
      }
    });
  };

  const toggleColumn = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleSave = () => {
    if (!dataSourceName.trim()) {
      toast.error('Please enter a data source name');
      return;
    }

    if (selectedColumns.length === 0) {
      toast.error('Please select at least one column');
      return;
    }

    // Filter data to only include selected columns
    const filteredData = parsedData.data.map(row => {
      const filteredRow = {};
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col];
      });
      return filteredRow;
    });

    const dataSource = {
      name: dataSourceName,
      type: 'csv',
      config: { 
        columns: selectedColumns,
        fileName: file.name,
        totalRows: parsedData.totalRows
      },
      data: filteredData,
      createdAt: new Date().toISOString()
    };

    dispatch({
      type: 'ADD_DATA_SOURCE',
      payload: dataSource
    });

    toast.success('Data source created successfully');
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setParsedData(null);
    setSelectedColumns([]);
    setDataSourceName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-text">Upload CSV Data</h2>
          <p className="text-dark-muted mt-1">
            Import data from a CSV file to create a new data source
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!file ? (
        /* File Upload Area */
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-dark-border hover:border-dark-border/80'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-dark-muted" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-dark-text">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-dark-muted mt-1">
                Supports files up to 10MB
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-dark-muted">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>CSV files only</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* File Processing */
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="font-medium text-dark-text">{file.name}</h3>
                  <p className="text-sm text-dark-muted">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={removeFile}
                className="p-2 text-dark-muted hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {parsing ? (
            /* Parsing State */
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-dark-text">Parsing CSV file...</p>
            </div>
          ) : parsedData ? (
            /* Data Configuration */
            <div className="space-y-6">
              {/* Data Source Name */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Data Source Name
                </label>
                <input
                  type="text"
                  value={dataSourceName}
                  onChange={(e) => setDataSourceName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter a name for this data source"
                />
              </div>

              {/* Column Selection */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">
                  Select Columns ({selectedColumns.length} of {parsedData.columns.length})
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {parsedData.columns.map((column) => (
                    <label
                      key={column}
                      className="flex items-center space-x-2 p-3 bg-dark-surface border border-dark-border rounded-md hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column)}
                        onChange={() => toggleColumn(column)}
                        className="rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-sm text-dark-text truncate">{column}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h3 className="text-lg font-semibold text-dark-text mb-4">
                  Data Preview ({parsedData.totalRows} total rows)
                </h3>
                
                <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-dark-bg border-b border-dark-border">
                        <tr>
                          {selectedColumns.map((column) => (
                            <th
                              key={column}
                              className="px-4 py-3 text-left font-medium text-dark-text"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.data.slice(0, 5).map((row, index) => (
                          <tr
                            key={index}
                            className="border-b border-dark-border last:border-b-0"
                          >
                            {selectedColumns.map((column) => (
                              <td
                                key={column}
                                className="px-4 py-3 text-dark-muted"
                              >
                                {row[column] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {parsedData.data.length > 5 && (
                    <div className="px-4 py-3 bg-dark-bg border-t border-dark-border text-center text-sm text-dark-muted">
                      Showing 5 of {parsedData.data.length} preview rows
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-dark-border">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-dark-muted hover:text-dark-text transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!dataSourceName.trim() || selectedColumns.length === 0}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Create Data Source</span>
                </button>
              </div>
            </div>
          ) : (
            /* Error State */
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-dark-text">Failed to parse CSV file</p>
              <button
                onClick={removeFile}
                className="mt-4 px-4 py-2 text-primary hover:text-primary/80 transition-colors"
              >
                Try another file
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
