import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import './SpreadsheetImport.css';

export default function SpreadsheetImport() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [mapping, setMapping] = useState({});
    const [importing, setImporting] = useState(false);
    const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: mapping, 4: confirm
    const fileInputRef = useRef(null);

    const requiredFields = [
        { key: 'orderId', label: 'Order ID', required: true },
        { key: 'product', label: 'Product', required: true },
        { key: 'customer', label: 'Customer Name', required: true },
        { key: 'phone', label: 'Phone Number', required: true },
        { key: 'address', label: 'Address', required: true },
        { key: 'area', label: 'Area/Region', required: false },
        { key: 'priority', label: 'Priority', required: false },
        { key: 'technicianId', label: 'Technician ID', required: false },
        { key: 'schedule', label: 'Schedule Date', required: false },
    ];

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
            toast.error('Please upload Excel (.xlsx, .xls) or CSV file');
            return;
        }

        setFile(selectedFile);
        setStep(2);

        // Parse file for preview
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await uploadAPI.parse(formData);
            setPreview(response.data);

            // Auto-detect column mapping
            if (response.data.headers) {
                const autoMapping = {};
                response.data.headers.forEach((header, index) => {
                    const lowerHeader = header.toLowerCase();
                    requiredFields.forEach(field => {
                        if (lowerHeader.includes(field.key.toLowerCase()) ||
                            lowerHeader.includes(field.label.toLowerCase().split(' ')[0])) {
                            autoMapping[field.key] = index;
                        }
                    });
                });
                setMapping(autoMapping);
            }

            setStep(3);
        } catch (error) {
            toast.error('Failed to parse file');
            console.error(error);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            const event = { target: { files: [droppedFile] } };
            handleFileSelect(event);
        }
    };

    const handleMappingChange = (fieldKey, columnIndex) => {
        setMapping(prev => ({
            ...prev,
            [fieldKey]: columnIndex === '' ? undefined : parseInt(columnIndex)
        }));
    };

    const handleImport = async () => {
        // Validate required fields
        const missingRequired = requiredFields
            .filter(f => f.required && mapping[f.key] === undefined)
            .map(f => f.label);

        if (missingRequired.length > 0) {
            toast.error(`Missing required fields: ${missingRequired.join(', ')}`);
            return;
        }

        setImporting(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('mapping', JSON.stringify(mapping));

            await uploadAPI.import(formData);
            toast.success(`Successfully imported ${preview.totalRows} orders!`);
            resetForm();
        } catch (error) {
            toast.error('Import failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setImporting(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setMapping({});
        setStep(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const downloadTemplate = () => {
        // Create a simple CSV template
        const headers = requiredFields.map(f => f.label).join(',');
        const sampleRow = 'ORD-001,INDIHOME,John Doe,08123456789,Jl. Example No. 1,Jakarta Selatan,HIGH,TX-9021,2026-02-15';
        const csvContent = `${headers}\n${sampleRow}`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'order_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Template downloaded!');
    };

    return (
        <div className="spreadsheet-import">
            <div className="import-header">
                <div>
                    <h1>📊 Spreadsheet Import</h1>
                    <p>Import orders and technicians from Excel/CSV files</p>
                </div>
                <button className="btn btn-secondary" onClick={downloadTemplate}>
                    <Download size={16} />
                    Download Template
                </button>
            </div>

            {/* Progress Steps */}
            <div className="import-steps">
                <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Upload</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Preview</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Map Columns</span>
                </div>
                <div className="step-line"></div>
                <div className={`step ${step >= 4 ? 'active' : ''}`}>
                    <span className="step-number">4</span>
                    <span className="step-label">Confirm</span>
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <div
                    className="upload-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        hidden
                    />
                    <FileSpreadsheet size={48} className="upload-icon" />
                    <h3>Drag & Drop your file here</h3>
                    <p>or click to browse</p>
                    <span className="upload-hint">Supports .xlsx, .xls, .csv files</span>
                </div>
            )}

            {/* Step 2-3: Preview & Mapping */}
            {step >= 2 && preview && (
                <div className="import-content">
                    <div className="file-info">
                        <FileSpreadsheet size={20} />
                        <span className="file-name">{file.name}</span>
                        <span className="file-meta">{preview.totalRows} rows detected</span>
                        <button className="btn-icon" onClick={resetForm}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Data Preview */}
                    <div className="card preview-card">
                        <h3>📋 Data Preview</h3>
                        <div className="table-container">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        {preview.headers?.map((header, i) => (
                                            <th key={i}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.sample?.slice(0, 5).map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => (
                                                <td key={j}>{cell || '-'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Column Mapping */}
                    {step >= 3 && (
                        <div className="card mapping-card">
                            <h3>🔗 Map Columns</h3>
                            <p className="mapping-hint">Match your spreadsheet columns to the required fields</p>

                            <div className="mapping-grid">
                                {requiredFields.map(field => (
                                    <div key={field.key} className="mapping-row">
                                        <label className={field.required ? 'required' : ''}>
                                            {field.label}
                                            {field.required && <span className="required-star">*</span>}
                                        </label>
                                        <select
                                            value={mapping[field.key] ?? ''}
                                            onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                            className={mapping[field.key] !== undefined ? 'mapped' : ''}
                                        >
                                            <option value="">-- Select Column --</option>
                                            {preview.headers?.map((header, i) => (
                                                <option key={i} value={i}>{header}</option>
                                            ))}
                                        </select>
                                        {mapping[field.key] !== undefined && (
                                            <Check size={16} className="check-icon" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="import-actions">
                        <button className="btn btn-secondary" onClick={resetForm}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleImport}
                            disabled={importing}
                        >
                            {importing ? (
                                <>
                                    <RefreshCw size={16} className="spinner" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    Import {preview.totalRows} Orders
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
