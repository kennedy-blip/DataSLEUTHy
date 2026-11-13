"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("bg-slate-900 border border-slate-800 rounded-xl p-6", className)}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const base = "font-medium px-4 py-2 rounded-lg transition-colors";
    const variants = {
      primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
      secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
      ghost: "hover:bg-slate-800 text-slate-300",
    };
    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const Table = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto">
      <table ref={ref} className={clsx("w-full text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  )
);
Table.displayName = "Table";

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={clsx("border-b border-slate-700", className)} {...props}>
    {children}
  </thead>
));
TableHeader.displayName = "TableHeader";

export const TableRow = forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, children, ...props }, ref) => (
    <tr ref={ref} className={clsx("border-b border-slate-800", className)} {...props}>
      {children}
    </tr>
  )
);
TableRow.displayName = "TableRow";

export const TableCell = forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => (
  <td ref={ref} className={clsx("px-4 py-2", className)} {...props}>
    {children}
  </td>
));
TableCell.displayName = "TableCell";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={clsx(
      "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export const Label = forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx("block text-sm font-medium text-slate-300 mb-1", className)}
      {...props}
    >
      {children}
    </label>
  )
);
Label.displayName = "Label";