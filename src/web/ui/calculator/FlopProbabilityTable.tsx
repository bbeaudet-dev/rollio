import React from 'react';

/**
 * Flop Probability Table
 */
export const FlopProbabilityTable: React.FC = () => {
  // Table data: 11 rows x 4 columns
  // First row is headers, first column is row labels
  // Edit this array to fill in your pre-calculated values
  const tableData: (string | number)[][] = [
    ['# of Dice', 'Beginner', 'Intermediate', 'Advanced'], // Header row
    ['1', '66.67%', '83.33%', '100%'],
    ['2', '33.33%', '69.44%', '100%'],
    ['3', '11.11%', '55.56%', '100%'],
    ['4', '1.85%', '41.67%', '99.54%'],
    ['5', '0.00%', '27.01%', '97.99%'],
    ['6', '0.00%', '11.57%', '88.73%'],
    ['7', '0.00%', '0.00%', '63.01%'],
    ['8', '0.00%', '0.00%', '24.01%'],
    ['9', '0.00%', '0.00%', '0.00%'],
    ['10', '0.00%', '0.00%', '0.00%'],  
  ];

  const numColumns = tableData[0].length;

  // Parse percentage from cell value and return color styling
  const getCellStyle = (cell: string | number, colIndex: number): { backgroundColor: string; color: string } => {
    // Skip header row, first column (row labels), and Notes column
    if (colIndex === 0) {
      return { backgroundColor: 'transparent', color: 'inherit' };
    }

    const cellStr = String(cell).trim();
    if (!cellStr || cellStr === '-') {
      return { backgroundColor: 'transparent', color: 'inherit' };
    }

    // Extract percentage value
    const match = cellStr.match(/(\d+\.?\d*)%/);
    if (!match) {
      return { backgroundColor: 'transparent', color: 'inherit' };
    }

    const percentage = parseFloat(match[1]);

    // Color coding based on percentage
    if (percentage === 0) {
      return { backgroundColor: '#d4edda', color: '#155724' }; // Light green, dark green
    } else if (percentage > 0 && percentage <= 50) {
      return { backgroundColor: '#fff3cd', color: '#856404' }; // Light yellow, dark yellow
    } else if (percentage > 50 && percentage < 100) {
      return { backgroundColor: '#ffeaa7', color: '#b8860b' }; // Light orange, dark orange
    } else if (percentage === 100) {
      return { backgroundColor: '#f8d7da', color: '#721c24' }; // Light red, dark red
    }

    return { backgroundColor: 'transparent', color: 'inherit' };
  };

  return (
    <div style={{
      marginTop: '0',
      marginBottom: '40px'
    }}>
      <div style={{
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <table style={{
          borderCollapse: 'collapse',
          backgroundColor: '#fff',
          border: '2px solid #dee2e6',
          borderRadius: '6px',
          overflow: 'hidden',
          minWidth: '400px'
        }}>
          <thead>
            {/* Title row - merged across all columns */}
            <tr>
              <th
                colSpan={numColumns}
                style={{
                  padding: '16px 16px 4px 16px',
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '20px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: 'none'
                }}
              >
                Flop Probabilities
              </th>
            </tr>
            {/* Subtitle row - merged across all columns */}
            <tr>
              <th
                colSpan={numColumns}
                style={{
                  padding: '0px 16px 12px 16px',
                  textAlign: 'center',
                  fontWeight: 'normal',
                  color: '#6c757d',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }}
              >
                Probabilities of flopping with varying difficulty and # of standard 6-sided dice
              </th>
            </tr>
            {/* Column headers row */}
            <tr style={{
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #dee2e6'
            }}>
              {tableData[0].map((cell, colIndex) => (
                <th
                  key={colIndex}
                  style={{
                    padding: '12px 16px',
                    textAlign: colIndex === 0 ? 'left' : 'center',
                    fontWeight: '600',
                    color: '#2c3e50',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    borderRight: colIndex < tableData[0].length - 1 ? '1px solid #dee2e6' : 'none'
                  }}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  borderBottom: rowIndex < tableData.length - 2 ? '1px solid #e1e5e9' : 'none',
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f8f9fa'
                }}
              >
                {row.map((cell, colIndex) => {
                  const cellStyle = getCellStyle(cell, colIndex);
                  return (
                    <td
                      key={colIndex}
                      style={{
                        padding: '10px 16px',
                        textAlign: colIndex === 0 ? 'left' : 'center',
                        color: colIndex === 0 ? '#495057' : cellStyle.color,
                        backgroundColor: cellStyle.backgroundColor,
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        borderRight: colIndex < row.length - 1 ? '1px solid #e1e5e9' : 'none',
                        fontWeight: colIndex === 0 ? '500' : 'normal'
                      }}
                    >
                      {cell || '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

