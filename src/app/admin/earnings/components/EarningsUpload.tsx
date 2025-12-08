// src/app/admin/earnings/components/EarningsUpload.tsx
// Earnings CSV Upload Component
// UI for uploading Amazon Associates earnings CSV files

"use client";

import { useState } from "react";

interface UploadStats {
  inserted: number;
  skipped: number;
  errors: number;
  total: number;
}

export default function EarningsUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".csv")) {
        setError("File must be a CSV");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const adminKey = sessionStorage.getItem("admin_key") || "";
      if (!adminKey) {
        setError("Please authenticate first");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/earnings/upload", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setResult(data.stats);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("earnings-csv-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh the page after a delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h2 className="text-2xl font-semibold mb-6 text-cyan-400">📤 Upload Earnings CSV</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Select Amazon Associates Earnings CSV File
          </label>
          <input
            id="earnings-csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-cyan-500/20 file:text-cyan-400
              hover:file:bg-cyan-500/30
              file:cursor-pointer
              cursor-pointer
              bg-slate-700/50 border border-slate-600/50 rounded-lg"
            disabled={uploading}
          />
          {file && (
            <p className="mt-2 text-sm text-slate-400">
              Selected: <span className="text-cyan-400">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✅ Upload Successful!</p>
            <div className="text-sm text-slate-300 space-y-1">
              <p>Inserted: <span className="text-green-400">{result.inserted}</span></p>
              <p>Skipped: <span className="text-yellow-400">{result.skipped}</span></p>
              <p>Errors: <span className="text-red-400">{result.errors}</span></p>
              <p>Total rows: {result.total}</p>
            </div>
            <p className="text-xs text-slate-400 mt-2">Refreshing page in 2 seconds...</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 disabled:bg-slate-700/50 disabled:cursor-not-allowed border border-cyan-500/50 rounded-lg px-4 py-3 text-cyan-400 font-medium transition-colors"
        >
          {uploading ? "Uploading..." : "Upload CSV"}
        </button>

        <div className="text-xs text-slate-500 mt-4 p-4 bg-slate-700/20 rounded-lg">
          <p className="font-semibold text-slate-400 mb-1">Expected CSV Format:</p>
          <p>Report Date, Marketplace, Tracking ID, Clicks, Ordered Items, Shipped Items, Returned Items, Commission, Bounties, Ad Fees, Currency</p>
          <p className="mt-2 text-slate-600">
            Export your earnings report from Amazon Associates and upload it here.
          </p>
        </div>
      </div>
    </div>
  );
}

