import React from 'react';

/**
 * Combination Probability Table
 */
export const CombinationProbabilityTable: React.FC = () => {

  const tableData: (string | number)[][] = [
    ['Combination | # of Dice ->', '6', '7', '8', '9', '10'],
    ['Single 1', '66.51%', '72.09%', '', '', ''],
    ['Single 5', '66.51%', '72.09%', '', '', ''],
    ['1 Pair', '98.46%', '100.00%', '', '', ''],
    ['2 Pair', '59.88%', '85.60%', '', '', ''],
    ['3 Pair', '4.84%', '23.18%', '', '', ''],
    ['3 of a Kind', '36.73%', '54.09%', '', '', ''],
    ['4 of a Kind', '5.22%', '10.58%', '', '', ''],
    ['5 of a Kind', '0.40%', '1.20%', '', '', ''],  
    ['6 of a Kind', '0.01%', '0.08%', '', '', ''],  
    ['Straight of 4', '27.01%', '38.41%', '', '', ''],  
    ['Straight of 5', '9.26%', '17.40%', '', '', ''],  
    ['Straight of 6', '1.54%', '5.40%', '', '', ''],  
    ['2 Triplets', '0.64%', '3.38%', '', '', ''],  
    ['Pyramid of 6', '15.43%', '', '', '', ''],  

    ['7 of a Kind', '-', '', '', '', ''],  
    ['Straight of 7', '-', '', '', '', ''],  

    ['4 Pair', '-', '', '', '', ''],
    ['8 of a Kind', '-', '', '', '', ''],  
    ['Straight of 8', '-', '', '', '', ''],  
    ['2 Quadruplets', '-', '', '', '', ''],  

    ['9 of a Kind', '-', '', '', '', ''],  
    ['3 Triplets', '-', '', '', '', ''],  
    ['Straight of 9', '-', '', '', '', ''],

    ['5 Pair', '-', '', '', '', ''],
    ['10 of a Kind', '-', '', '', '', ''],  
    ['Straight of 10', '-', '', '', '', ''],   
    ['2 Quintuplets', '-', '', '', '', ''],  
    ['Pyramid of 10', '-', '', '', '', ''],  

    ['2 Sextuplets', '-', '', '', '', ''],  
    ['2 Septuplets', '-', '', '', '', ''],  
    ['2 Octuplets', '-', '', '', '', ''],  
    ['2 Nonuplets', '-', '', '', '', ''],  
    ['2 Decuplets', '-', '', '', '', ''],  
    ['Pyramid of 15', '-', '', '', '', ''],

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
                Combination Probabilities
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
                Probabilities of rolling combinations with varying # of 6-sided dice
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

