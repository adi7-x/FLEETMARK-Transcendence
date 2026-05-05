import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableStationItem({ id, name, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '12px 16px',
    marginBottom: '8px',
    background: isDragging ? '#e8f5e9' : '#fff',
    border: isDragging ? '1px solid #4caf50' : '1px solid #e0e0e0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div 
        {...attributes} 
        {...listeners}
        style={{ 
          cursor: 'grab', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flex: 1
        }}
        title="Drag to reorder"
      >
        <span style={{ 
          color: '#aaa',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </span>
        <span style={{ fontWeight: '500', color: '#333' }}>{name}</span>
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#ef5350',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}
        onMouseOver={(e) => e.target.style.background = '#ffebee'}
        onMouseOut={(e) => e.target.style.background = 'none'}
        title="Remove station from route"
      >
        Remove
      </button>
    </div>
  );
}
