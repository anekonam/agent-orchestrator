import React from 'react';
import './TableVisualization.css';

interface TableData {
  title: string;
  headers: string[];
  data: any[][];
  metadata?: any;
}

interface TableVisualizationProps {
  table: TableData;
  hideTitle?: boolean;
}

const TableVisualization: React.FC<TableVisualizationProps> = ({ table, hideTitle = false }) => {
  return (
    <div className="table-visualization">
      {!hideTitle && table.title && table.title.trim() !== '' && (
        <h4 className="table-title">{table.title}</h4>
      )}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {table.headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>
                    {typeof cell === 'object' && cell !== null
                      ? JSON.stringify(cell)
                      : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableVisualization;