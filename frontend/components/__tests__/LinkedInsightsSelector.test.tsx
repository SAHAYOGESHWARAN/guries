import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedInsightsSelector from '../LinkedInsightsSelector';

const contentTypes = [
  { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long form', default_attributes: [], status: 'active' },
  { id: 2, content_type: 'Blog', category: 'Editorial', description: 'Article', default_attributes: [], status: 'active' }
];

test('renders list and toggles selection', () => {
  const onSelectionChange = vi.fn();
  render(<LinkedInsightsSelector contentTypes={contentTypes} selectedIds={[1]} onSelectionChange={onSelectionChange} />);

  // shows selected count
  expect(screen.getByText('1 selected')).toBeInTheDocument();

  // find second checkbox and click
  const checkbox = screen.getByLabelText(/Blog/i).previousSibling as HTMLElement | null;
  // fallback: find by content text and click the surrounding label
  const blogLabel = screen.getByText('Blog');
  fireEvent.click(blogLabel);

  // onSelectionChange should be called (toggle)
  expect(onSelectionChange).toHaveBeenCalled();
});
