import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, ChevronDown, Loader2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// Create a new component for the export dropdown
const ExportDropdown = ({ data, fileName, onExportStart, onExportEnd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(null); // 'excel' | 'csv' | 'pdf' | null
  const [error, setError] = useState(null);

  const handleExport = useCallback(async (exportFn, type) => {
    if (!data || data.length === 0) {
      toast.warning('No data to export');
      setIsOpen(false);
      return;
    }

    setExporting(type);
    setError(null);
    onExportStart?.();

    try {
      await exportFn();
      toast.success(`Successfully exported ${data.length} records to ${type.toUpperCase()}`);
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Export failed');
      toast.error(`Failed to export: ${err.message || 'Unknown error'}`);
    } finally {
      setExporting(null);
      setIsOpen(false);
      onExportEnd?.();
    }
  }, [data, onExportStart, onExportEnd]);

  const exportToExcel = useCallback(async () => {
    return new Promise((resolve, reject) => {
      try {
        // Format data for Excel
        const formattedData = data.map(vehicle => ({
          ID: vehicle.id,
          Make: vehicle.make,
          Model: vehicle.model,
          Year: vehicle.year,
          VIN: vehicle.vin,
          Mileage: vehicle.mileage,
          Price: vehicle.price || vehicle.proposed_price || 'N/A',
          'Listing Type': vehicle.listing_type,
          Status: vehicle.verification_state,
          Owner: vehicle.owner?.username || 'N/A',
          Location: vehicle.location || 'N/A',
          'Fuel Type': vehicle.fuel_type || 'N/A',
          Transmission: vehicle.transmission || 'N/A',
          'Body Type': vehicle.body_type || 'N/A',
          'Created At': vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Set column widths
        worksheet['!cols'] = [
          { wch: 8 },  // ID
          { wch: 15 }, // Make
          { wch: 15 }, // Model
          { wch: 8 },  // Year
          { wch: 20 }, // VIN
          { wch: 12 }, // Mileage
          { wch: 12 }, // Price
          { wch: 15 }, // Listing Type
          { wch: 15 }, // Status
          { wch: 15 }, // Owner
          { wch: 15 }, // Location
          { wch: 12 }, // Fuel Type
          { wch: 12 }, // Transmission
          { wch: 12 }, // Body Type
          { wch: 15 }, // Created At
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }, [data, fileName]);

  const exportToCSV = useCallback(async () => {
    return new Promise((resolve, reject) => {
      try {
        const formattedData = data.map(vehicle => ({
          ID: vehicle.id,
          Make: vehicle.make,
          Model: vehicle.model,
          Year: vehicle.year,
          VIN: vehicle.vin,
          Mileage: vehicle.mileage,
          Price: vehicle.price || vehicle.proposed_price || '',
          'Listing Type': vehicle.listing_type,
          Status: vehicle.verification_state,
          Owner: vehicle.owner?.username || '',
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }, [data, fileName]);

  const exportToPDF = useCallback(async () => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF('landscape');

        // Add header with logo and title
        doc.setFillColor(225, 45, 57);
        doc.rect(0, 0, doc.internal.pageSize.width, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Auto Eden - Vehicle List', 14, 17);

        // Add export date
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Exported: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 60, 17);

        // Reset text color for table
        doc.setTextColor(0, 0, 0);

        // Prepare data for the table
        const tableData = data.map(vehicle => [
          vehicle.id,
          vehicle.make,
          vehicle.model,
          vehicle.year,
          vehicle.vin?.substring(0, 10) + '...' || 'N/A',
          vehicle.mileage || 'N/A',
          vehicle.price || vehicle.proposed_price ? `$${Number(vehicle.price || vehicle.proposed_price).toLocaleString()}` : 'N/A',
          vehicle.listing_type || 'N/A',
          vehicle.verification_state || 'N/A',
          vehicle.owner?.username || 'N/A'
        ]);

        // Add table
        doc.autoTable({
          head: [['ID', 'Make', 'Model', 'Year', 'VIN', 'Mileage', 'Price', 'Type', 'Status', 'Owner']],
          body: tableData,
          startY: 30,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [225, 45, 57],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          didDrawPage: (data) => {
            // Add footer with page numbers
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(
              `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            );
          }
        });

        // Add summary
        const finalY = doc.lastAutoTable.finalY || 30;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Records: ${data.length}`, 14, finalY + 10);

        doc.save(`${fileName}.pdf`);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }, [data, fileName]);

  const isExporting = exporting !== null;

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => !isExporting && setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2
          ${isExporting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-50'}`}
      >
        {isExporting ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span className="hidden md:inline">
          {isExporting ? 'Exporting...' : 'Export'}
        </span>
        <ChevronDown size={16} className={isExporting ? 'opacity-50' : ''} />
      </button>

      {isOpen && !isExporting && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              {error && (
                <div className="px-4 py-2 text-sm text-red-600 bg-red-50 flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                onClick={() => handleExport(exportToExcel, 'excel')}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded text-xs font-bold">
                    XLS
                  </span>
                  Export to Excel
                </span>
                {exporting === 'excel' && <Loader2 size={14} className="animate-spin" />}
              </button>

              <button
                onClick={() => handleExport(exportToCSV, 'csv')}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded text-xs font-bold">
                    CSV
                  </span>
                  Export to CSV
                </span>
                {exporting === 'csv' && <Loader2 size={14} className="animate-spin" />}
              </button>

              <button
                onClick={() => handleExport(exportToPDF, 'pdf')}
                className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded text-xs font-bold">
                    PDF
                  </span>
                  Export to PDF
                </span>
                {exporting === 'pdf' && <Loader2 size={14} className="animate-spin" />}
              </button>

              <div className="border-t border-gray-100 my-1" />

              <div className="px-4 py-2 text-xs text-gray-500">
                {data?.length || 0} records will be exported
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportDropdown;
