"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '../ui/card';

export interface Column<T> {
  accessor: keyof T | ((row: T) => any);
  header: string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { [key: string]: any }> {
  columns: Column<T>[];
  data: T[];
  filterColumn?: string; // Can be a nested key like 'paciente.nombreCompleto'
  filterPlaceholder?: string;
}

// Helper function to get nested property
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};


export function DataTable<T extends { [key: string]: any }>({ columns, data, filterColumn, filterPlaceholder }: DataTableProps<T>) {
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

 const filteredData = data.filter(item => {
    if (!filter) return true;
    const lowercasedFilter = filter.toLowerCase();

    // Check all columns for a match
    return columns.some(col => {
      let value;
      if (typeof col.accessor === 'function') {
        value = col.accessor(item);
      } else {
        // Handle nested paths for accessor key
        value = getNestedValue(item, col.accessor as string);
      }
      return String(value).toLowerCase().includes(lowercasedFilter);
    });
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const actionsColumn = columns.find(c => String(c.accessor) === 'actions' || c.header.toLowerCase() === 'acciones');

  return (
    <div className="space-y-4">
      {filterColumn && (
        <div className="flex items-center">
          <Input
            placeholder={filterPlaceholder || `Filtrar...`}
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on new filter
            }}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {paginatedData.length > 0 ? (
          paginatedData.map((row, rowIndex) => (
            <Card key={rowIndex}>
              <CardContent className="space-y-3 p-4">
                {columns.map((col, colIndex) => {
                  // Don't render the "actions" column as a label-value pair
                  if (String(col.accessor) === 'actions' || col.header.toLowerCase() === 'acciones') {
                    return null;
                  }

                  const cellContent = col.cell
                    ? col.cell(row)
                    : typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : String(getNestedValue(row, col.accessor as string) ?? '');

                  return (
                    <div key={colIndex} className="flex justify-between items-start text-sm">
                      <span className="font-semibold text-muted-foreground mr-2">{col.header}:</span>
                      <div className="text-right">{cellContent}</div>
                    </div>
                  );
                })}
                 {/* Render actions at the bottom of the card */}
                 {actionsColumn && (
                    <div className="flex justify-end border-t pt-3 mt-3">
                      {actionsColumn.cell!(row)}
                    </div>
                 )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Sin resultados.
          </div>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex}>
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : String(getNestedValue(row, col.accessor as string) ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
