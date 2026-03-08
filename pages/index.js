import { useMemo, useState } from 'react';
import UploadBox from '../components/UploadBox';

function downloadCsvFile(csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'email-validation-results.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [emailText, setEmailText] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [results, setResults] = useState([]);
  const [resultCsv, setResultCsv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsedTextEmails = useMemo(
    () =>
      emailText
        .split(/[\n,;\t ]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    [emailText]
  );

  const handleValidate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: parsedTextEmails,
          csvContent
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Validation failed');
      }

      setResults(payload.results || []);
      setResultCsv(payload.csv || '');
    } catch (requestError) {
      setResults([]);
      setResultCsv('');
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24, fontFamily: 'Arial' }}>
      <h1>Email Validator Web</h1>

      <label htmlFor="emails">Paste emails (comma, space, or newline separated)</label>
      <textarea
        id="emails"
        rows={8}
        style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
        value={emailText}
        onChange={(event) => setEmailText(event.target.value)}
        placeholder="example@domain.com"
      />

      <h3>Or upload CSV file</h3>
      <UploadBox onFileSelect={setCsvContent} />

      <button
        style={{ marginTop: 16, padding: '10px 16px', cursor: 'pointer' }}
        onClick={handleValidate}
        disabled={loading}
      >
        {loading ? 'Validating...' : 'Validate Emails'}
      </button>

      {error ? <p style={{ color: 'red' }}>{error}</p> : null}

      {results.length > 0 ? (
        <section style={{ marginTop: 24 }}>
          <h2>Validation Results ({results.length})</h2>
          <button
            style={{ marginBottom: 12, padding: '8px 12px', cursor: 'pointer' }}
            onClick={() => downloadCsvFile(resultCsv)}
          >
            Download Results CSV
          </button>

          <table width="100%" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Email</th>
                <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
                <tr key={`${item.email}-${index}`}>
                  <td style={{ borderBottom: '1px solid #f0f0f0' }}>{item.email}</td>
                  <td style={{ borderBottom: '1px solid #f0f0f0' }}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
