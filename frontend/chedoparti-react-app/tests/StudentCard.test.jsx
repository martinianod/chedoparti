import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StudentCard from '../src/pages/Coach/Students/StudentCard';

// Mock dnd-kit hooks
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('StudentCard', () => {
  const mockStudent = {
    id: 1,
    name: 'Juan Perez',
    level: 'Intermedio',
    sport: 'Padel',
    isMember: true,
  };

  it('renders student information correctly', () => {
    render(
      <StudentCard 
        student={mockStudent} 
        groups={[]} 
        onEdit={() => {}} 
        onDelete={() => {}} 
      />
    );

    expect(screen.getByText('Juan Perez')).toBeDefined();
    expect(screen.getByText('Socio')).toBeDefined();
    expect(screen.getByText('Padel')).toBeDefined();
  });
});
