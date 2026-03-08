import { useRef } from 'react';

export default function UploadBox({ onFileSelect }) {
  const inputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      onFileSelect('');
      return;
    }

    const content = await file.text();
    onFileSelect(content);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
      />
    </div>
  );
}
