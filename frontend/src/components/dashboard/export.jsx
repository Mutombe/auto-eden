import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useState } from 'react';
import { Download, Car, ChevronDown } from 'lucide-react'

// Create a new component for the export dropdown
const ExportDropdown = ({ data, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    link.click();
    setIsOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Vehicle List', 14, 15);
    
    // Prepare data for the table
    const tableData = data.map(vehicle => [
      vehicle.id,
      vehicle.make,
      vehicle.model,
      vehicle.year,
      vehicle.vin,
      vehicle.mileage,
      `$${vehicle.price || vehicle.proposed_price}`,
      vehicle.listing_type,
      vehicle.verification_state,
      vehicle.owner?.username || 'N/A'
    ]);

    // Add table
    doc.autoTable({
      head: [['ID', 'Make', 'Model', 'Year', 'VIN', 'Mileage', 'Price', 'Type', 'Status', 'Owner']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [225, 45, 57] } // Red color similar to Auto Eden
    });

    doc.save(`${fileName}.pdf`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50"
      >
        <Download size={16} />
        <span className="hidden md:inline">Export</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={exportToExcel}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              Export to Excel
            </button>
            <button
              onClick={exportToCSV}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              Export to CSV
            </button>
            <button
              onClick={exportToPDF}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              role="menuitem"
            >
              Export to PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;