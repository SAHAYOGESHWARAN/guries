/**
 * Advanced export utilities for CSV, Excel, and PDF formats
 */

export interface ExportOptions {
    filename?: string;
    sheetName?: string;
    includeHeaders?: boolean;
    dateFormat?: 'ISO' | 'US' | 'EU';
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (data: any[], filename: string = 'export'): void => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                if (Array.isArray(value)) return `"${JSON.stringify(value)}"`;
                if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data: any[], filename: string = 'export'): void => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
};

/**
 * Export data to TSV (Tab-Separated Values) format
 */
export const exportToTSV = (data: any[], filename: string = 'export'): void => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const tsvContent = [
        headers.join('\t'),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                if (typeof value === 'object') return JSON.stringify(value);
                return String(value).replace(/\t/g, ' ');
            }).join('\t')
        )
    ].join('\n');

    downloadFile(tsvContent, `${filename}.tsv`, 'text/tab-separated-values');
};

/**
 * Export data to HTML table format
 */
export const exportToHTML = (data: any[], filename: string = 'export'): void => {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const headers = Object.keys(data[0]);
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    tr:hover { background-color: #ddd; }
  </style>
</head>
<body>
  <h1>${filename}</h1>
  <table>
    <thead>
      <tr>
        ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(h => `<td>${escapeHtml(String(row[h] || ''))}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

    downloadFile(htmlContent, `${filename}.html`, 'text/html');
};

/**
 * Helper function to download file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Helper function to escape HTML special characters
 */
const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Get formatted date string
 */
export const getFormattedDate = (format: 'ISO' | 'US' | 'EU' = 'ISO'): string => {
    const now = new Date();
    switch (format) {
        case 'US':
            return now.toLocaleDateString('en-US');
        case 'EU':
            return now.toLocaleDateString('en-GB');
        case 'ISO':
        default:
            return now.toISOString().split('T')[0];
    }
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (prefix: string, extension: string = 'csv'): string => {
    const timestamp = getFormattedDate('ISO').replace(/-/g, '');
    return `${prefix}_${timestamp}.${extension}`;
};
