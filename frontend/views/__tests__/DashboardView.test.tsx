import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import DashboardView from '../DashboardView';

// Mock fetch globally
global.fetch = vi.fn();

describe('DashboardView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock environment variable
        Object.defineProperty(import.meta, 'env', {
            value: { VITE_API_URL: '/api/v1' },
            writable: true
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders loading state initially', () => {
        (global.fetch as any).mockImplementation(() =>
            new Promise(() => { }) // Never resolves to keep loading state
        );

        render(<DashboardView />);
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    test('renders dashboard header', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                activeCampaigns: 5,
                campaignsTrendPercent: 12,
                contentPublished: 24,
                contentTrendPercent: 8,
                tasksCompleted: 18,
                tasksTrendPercent: -3,
                teamMembers: 12
            })
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Search campaigns, tasks, content...')).toBeInTheDocument();
        });
    });

    test('renders stat cards with correct values', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                activeCampaigns: 5,
                campaignsTrendPercent: 12,
                contentPublished: 24,
                contentTrendPercent: 8,
                tasksCompleted: 18,
                tasksTrendPercent: -3,
                teamMembers: 12
            })
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('Content Published')).toBeInTheDocument();
            expect(screen.getByText('24')).toBeInTheDocument();
            expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
            expect(screen.getByText('18')).toBeInTheDocument();
            expect(screen.getByText('Team Members')).toBeInTheDocument();
            expect(screen.getByText('12')).toBeInTheDocument();
        });
    });

    test('renders recent projects section', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        activeCampaigns: 5,
                        campaignsTrendPercent: 12,
                        contentPublished: 24,
                        contentTrendPercent: 8,
                        tasksCompleted: 18,
                        tasksTrendPercent: -3,
                        teamMembers: 12
                    })
                });
            }
            if (url.includes('/projects')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 1,
                            name: 'Website Redesign',
                            status: 'In Progress',
                            progress: 65,
                            updated_at: new Date().toISOString()
                        }
                    ]
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => []
            });
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('Recent Projects')).toBeInTheDocument();
            expect(screen.getByText('Website Redesign')).toBeInTheDocument();
        });
    });

    test('renders upcoming tasks section', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        activeCampaigns: 5,
                        campaignsTrendPercent: 12,
                        contentPublished: 24,
                        contentTrendPercent: 8,
                        tasksCompleted: 18,
                        tasksTrendPercent: -3,
                        teamMembers: 12
                    })
                });
            }
            if (url.includes('/tasks')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 1,
                            name: 'Design Homepage Banner',
                            status: 'In Progress',
                            priority: 'high',
                            due_date: new Date().toISOString()
                        }
                    ]
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => []
            });
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
            expect(screen.getByText('Design Homepage Banner')).toBeInTheDocument();
        });
    });

    test('renders recent activity section', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                activeCampaigns: 5,
                campaignsTrendPercent: 12,
                contentPublished: 24,
                contentTrendPercent: 8,
                tasksCompleted: 18,
                tasksTrendPercent: -3,
                teamMembers: 12
            })
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        });
    });

    test('handles API errors gracefully with fallback data', async () => {
        (global.fetch as any).mockRejectedValue(new Error('API Error'));

        render(<DashboardView />);

        await waitFor(() => {
            // Should still render with fallback data
            expect(screen.getByText('Dashboard')).toBeInTheDocument();
            expect(screen.getByText('Active Campaigns')).toBeInTheDocument();
        });
    });

    test('displays fallback message when no projects', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        activeCampaigns: 5,
                        campaignsTrendPercent: 12,
                        contentPublished: 24,
                        contentTrendPercent: 8,
                        tasksCompleted: 18,
                        tasksTrendPercent: -3,
                        teamMembers: 12
                    })
                });
            }
            if (url.includes('/projects')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => []
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => []
            });
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('No projects yet')).toBeInTheDocument();
        });
    });

    test('displays fallback message when no tasks', async () => {
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/dashboard/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        activeCampaigns: 5,
                        campaignsTrendPercent: 12,
                        contentPublished: 24,
                        contentTrendPercent: 8,
                        tasksCompleted: 18,
                        tasksTrendPercent: -3,
                        teamMembers: 12
                    })
                });
            }
            if (url.includes('/tasks')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => []
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => []
            });
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('No tasks yet')).toBeInTheDocument();
        });
    });

    test('calls onNavigate when view all projects button is clicked', async () => {
        const mockOnNavigate = vi.fn();

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                activeCampaigns: 5,
                campaignsTrendPercent: 12,
                contentPublished: 24,
                contentTrendPercent: 8,
                tasksCompleted: 18,
                tasksTrendPercent: -3,
                teamMembers: 12
            })
        });

        render(<DashboardView onNavigate={mockOnNavigate} />);

        await waitFor(() => {
            const viewAllButtons = screen.getAllByText(/View all →/);
            viewAllButtons[0].click();
            expect(mockOnNavigate).toHaveBeenCalledWith('projects');
        });
    });

    test('displays trend indicators correctly', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                activeCampaigns: 5,
                campaignsTrendPercent: 12,
                contentPublished: 24,
                contentTrendPercent: 8,
                tasksCompleted: 18,
                tasksTrendPercent: -3,
                teamMembers: 12
            })
        });

        render(<DashboardView />);

        await waitFor(() => {
            expect(screen.getByText('+12% from last month')).toBeInTheDocument();
            expect(screen.getByText('+8% from last month')).toBeInTheDocument();
            expect(screen.getByText('-3% from last month')).toBeInTheDocument();
        });
    });


});
