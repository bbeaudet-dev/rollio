import React from 'react';
import { FlopProbabilityTable } from './FlopProbabilityTable';
import { CombinationProbabilityTable } from './CombinationProbabilityTable';

/**
 * Manual Probability Tables
 * Container for pre-calculated probability tables
 */
export const ManualProbabilityTables: React.FC = () => {
  return (
    <div style={{
      marginTop: '60px',
      marginBottom: '30px',
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '8px',
      border: '1px solid #e1e5e9',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '8px'
      }}>
        Manual Probability Tables
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '40px',
        fontStyle: 'italic'
      }}>
        Code- and Time-intensive probability tables for common configurations
      </p>
      
      <FlopProbabilityTable />
      
    <CombinationProbabilityTable />
          
    </div>
  );
};

