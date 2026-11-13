"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFileUpload } from "@/lib/file-upload";
import { Card, Input, Table, TableHeader, TableRow, TableCell, Button } from "@/components/ui";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setLoading(true);
    
    try {
      const result = await useFileUpload(file);
      setPreview(result.preview);
      setColumns(result.columns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !columns.length) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resp = await fetch("/api/datasets", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) throw new Error("Upload failed");
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Upload CSV</h1>
      
      <Card>
        <Input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          disabled={loading}
        />
        {loading && <p className="mt-2 text-slate-500">Parsing file…</p>}
      </Card>
      
      {preview.length > 0 && (
        <Card className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400 mb-4">Preview</h2>
          <Table>
            <TableHeader>
              {columns.map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
            </TableHeader>
            {preview.map((row: any, i: number) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col}>{row[col] ?? ""}</TableCell>
                ))}
              </TableRow>
            ))}
          </Table>
        </Card>
      )}
      
      {columns.length > 0 && (
        <Card className="mt-8">
          <Button onClick={handleImport} disabled={loading} className="w-full">
            {loading ? "Importing…" : "Import Dataset"}
          </Button>
        </Card>
      )}
    </main>
  );
}