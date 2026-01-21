import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedInsightsSelector from '../../components/LinkedInsightsSelector';

const mockContentTypes = [
  { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form' },
  { id: 2, content_type: 'Blog', category: 'Editorial', description: 'Article' }
];

test('renders insights selector and toggles selection', async () => {
  const onChange = vi.fn();
  render(<LinkedInsightsSelector contentTypes={mockContentTypes as any} selectedIds={[]} onSelectionChange={onChange} />);

  // Should show both content types
  expect(screen.getByText('Pillar')).toBeInTheDocument();
  expect(screen.getByText('Blog')).toBeInTheDocument();

  // Click the first checkbox
  const checkbox = screen.getAllByRole('checkbox')[0];
  fireEvent.click(checkbox);
  expect(onChange).toHaveBeenCalled();
});
