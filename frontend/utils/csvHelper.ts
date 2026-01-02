
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        alert("No data to export.");
        return;
    }

    // Extract headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const val = row[fieldName];
            // Escape quotes and wrap in quotes if string contains comma
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(','))
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return resolve([]);

            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            
            const result = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // Handle simplified CSV parsing (doesn't handle complex quoted commas perfectly but good for standard exports)
                const currentline = lines[i].split(','); 
                const obj: any = {};
                
                for (let j = 0; j < headers.length; j++) {
                    let val = currentline[j]?.trim();
                    if (val && val.startsWith('"') && val.endsWith('"')) {
                        val = val.substring(1, val.length - 1).replace(/""/g, '"');
                    }
                    obj[headers[j]] = val;
                }
                result.push(obj);
            }
            resolve(result);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};
