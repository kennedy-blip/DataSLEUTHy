"use client";

import { useState } from "react";

export interface FileUploadResult {
  preview: Record<string, any>[];
  columns: string[];
}

export function useFileUpload(file: File): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.trim().split("\n");
        if (lines.length === 0) {
          reject(new Error("Empty file"));
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim());
        const preview = lines.slice(1, 6).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, any> = {};
          headers.forEach((h, i) => {
            row[h] = values[i] ?? "";
          });
          return row;
        });
        resolve({ preview, columns: headers });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}