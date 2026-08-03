import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';


const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  emptyTitle = 'No Records Found',
  sortKey,
  sortDir = 'asc',
  onSort,
  keyField = '_id',
  rowClassName,
}) => {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          {/* ── Header ── */}
          {(data.length > 0 || loading) && (
            <TableHeader>
              <TableRow className="bg-white border-b border-slate-200">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`whitespace-nowrap ${col.className || ''} ${col.sortable ? 'cursor-pointer select-none' : ''
                      }`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className={`flex items-center gap-1 ${col.className?.includes('text-center') ? 'justify-center' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="ml-1 inline-flex items-center">
                          <ArrowUpDown
                            size={14}
                            strokeWidth={2.5}
                            className={
                              sortKey === col.key
                                ? 'text-black font-bold'
                                : 'text-slate-400 hover:text-black transition-colors'
                            }
                          />
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}

          {/* ── Body ── */}
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-xs font-medium">Loading records…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center p-0 align-middle">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <EmptyState title={emptyTitle} message={emptyMessage} />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row[keyField]}
                  className={typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || ''}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.tdClassName || ''}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
