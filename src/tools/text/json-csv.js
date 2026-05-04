export const toolConfig = {
  id: 'json-csv',
  name: 'JSON to CSV',
  category: 'text',
  description: 'Convert JSON array to CSV format.',
  icon: '📊',
  status: 'done'
};

export function initJsonCsv() {
  const textarea = document.getElementById('json-input');
  const output = document.getElementById('csv-output');
  const convertBtn = document.getElementById('convert-json-csv');
  const copyBtn = document.getElementById('copy-csv');
  const clearBtn = document.getElementById('clear-json');

  if (!textarea || !output) return;

  function convert() {
    try {
      const json = JSON.parse(textarea.value);
      const csv = jsonToCsv(json);
      output.value = csv;
    } catch (e) {
      output.value = 'Error: Invalid JSON';
    }
  }

  function jsonToCsv(data) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }

  if (convertBtn) convertBtn.addEventListener('click', convert);
  
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(output.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy CSV', 2000);
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      textarea.value = '';
      output.value = '';
      textarea.focus();
    });
  }
}