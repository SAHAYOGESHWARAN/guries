import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkflowStageBanner from '../WorkflowStageBanner';

describe('WorkflowStageBanner Component', () => {

    test('renders banner for Moved to CW stage', () => {
        render(<WorkflowStageBanner workflowStage="Moved to CW" />);

        expect(screen.getByText('CW is working on this asset')).toBeInTheDocument();
        expect(screen.getByText(/Content Writing team is currently editing/)).toBeInTheDocument();
        expect(screen.getByText('✍️')).toBeInTheDocument();
    });

    test('renders banner for Moved to GD stage', () => {
        render(<WorkflowStageBanner workflowStage="Moved to GD" />);

        expect(screen.getByText('GD is working on this asset')).toBeInTheDocument();
        expect(screen.getByText(/Graphic Design team is currently working/)).toBeInTheDocument();
        expect(screen.getByText('🎨')).toBeInTheDocument();
    });

    test('renders banner for Moved to WD stage', () => {
        render(<WorkflowStageBanner workflowStage="Moved to WD" />);

        expect(screen.getByText('WD is working on this asset')).toBeInTheDocument();
        expect(screen.getByText(/Web Development team is currently working/)).toBeInTheDocument();
        expect(screen.getByText('💻')).toBeInTheDocument();
    });

    test('does not render banner for other stages', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Add" />);
        expect(container.firstChild).toBeNull();
    });

    test('does not render banner when workflowStage is undefined', () => {
        const { container } = render(<WorkflowStageBanner workflowStage={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    test('does not render banner when workflowStage is null', () => {
        const { container } = render(<WorkflowStageBanner workflowStage={null as any} />);
        expect(container.firstChild).toBeNull();
    });

    test('banner has correct styling classes for CW', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Moved to CW" />);
        const banner = container.querySelector('div');

        expect(banner).toHaveClass('bg-purple-50');
        expect(banner).toHaveClass('border-purple-400');
        expect(banner).toHaveClass('text-purple-900');
    });

    test('banner has correct styling classes for GD', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Moved to GD" />);
        const banner = container.querySelector('div');

        expect(banner).toHaveClass('bg-pink-50');
        expect(banner).toHaveClass('border-pink-400');
        expect(banner).toHaveClass('text-pink-900');
    });

    test('banner has correct styling classes for WD', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Moved to WD" />);
        const banner = container.querySelector('div');

        expect(banner).toHaveClass('bg-cyan-50');
        expect(banner).toHaveClass('border-cyan-400');
        expect(banner).toHaveClass('text-cyan-900');
    });

    test('banner has proper layout structure', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Moved to CW" />);
        const banner = container.querySelector('div');

        expect(banner).toHaveClass('flex');
        expect(banner).toHaveClass('items-center');
        expect(banner).toHaveClass('gap-4');
        expect(banner).toHaveClass('rounded-xl');
        expect(banner).toHaveClass('border-2');
        expect(banner).toHaveClass('shadow-md');
    });

    test('emoji has correct styling', () => {
        const { container } = render(<WorkflowStageBanner workflowStage="Moved to CW" />);
        const emoji = container.querySelector('span.text-3xl');

        expect(emoji).toHaveClass('flex-shrink-0');
        expect(emoji).toHaveClass('text-3xl');
    });

    test('title has correct styling', () => {
        render(<WorkflowStageBanner workflowStage="Moved to CW" />);
        const title = screen.getByText('CW is working on this asset');

        expect(title).toHaveClass('font-bold');
        expect(title).toHaveClass('text-lg');
    });

    test('description has correct styling', () => {
        render(<WorkflowStageBanner workflowStage="Moved to CW" />);
        const description = screen.getByText(/Content Writing team is currently editing/);

        expect(description).toHaveClass('text-sm');
        expect(description).toHaveClass('opacity-90');
        expect(description).toHaveClass('mt-1');
    });
});
