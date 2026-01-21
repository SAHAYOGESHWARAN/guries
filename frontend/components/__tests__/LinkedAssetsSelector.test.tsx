import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LinkedAssetsSelector from '../LinkedAssetsSelector';

const assets = [
  { id: 1, name: 'Hero Image', type: 'Image', asset_category: 'Banner', status: 'active' },
  { id: 2, name: 'Promo PDF', type: 'PDF', asset_category: 'Doc', status: 'active' }
];

test('renders assets and filters by search', () => {
  const onSelectionChange = vi.fn();
  render(<LinkedAssetsSelector assets={assets as any} selectedIds={[]} onSelectionChange={onSelectionChange} />);

  // both assets present
  expect(screen.getByText('Hero Image')).toBeInTheDocument();
  expect(screen.getByText('Promo PDF')).toBeInTheDocument();

  // type filter should include 'Image' and 'PDF'
  const search = screen.getByPlaceholderText('Search assets...');
  fireEvent.change(search, { target: { value: 'Hero' } });

  // now only Hero Image should be visible
  expect(screen.getByText('Hero Image')).toBeInTheDocument();
  expect(screen.queryByText('Promo PDF')).toBeNull();
});
