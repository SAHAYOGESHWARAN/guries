import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedAssetsSelector from '../../components/LinkedAssetsSelector';

const mockAssets = [
  { id: 1, name: 'Hero', type: 'Image', asset_category: 'Banner' },
  { id: 2, name: 'Guide', type: 'PDF', asset_category: 'Docs' }
];

test('renders assets selector and filters by search', () => {
  const onChange = vi.fn();
  render(<LinkedAssetsSelector assets={mockAssets as any} selectedIds={[]} onSelectionChange={onChange} />);

  expect(screen.getByText('Linked Assets')).toBeInTheDocument();

  const input = screen.getByPlaceholderText('Search assets...');
  fireEvent.change(input, { target: { value: 'hero' } });
  expect(screen.getByText('Hero')).toBeInTheDocument();
});
