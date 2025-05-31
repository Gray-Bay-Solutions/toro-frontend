"use client"

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Plus, Search } from "lucide-react";

interface Column {
  header: string;
  accessorKey: string;
  accessorFn?: (row: any) => any;
  icon?: any;
  isNumber?: boolean;
  isStatus?: boolean;
  render?: (value: any, row?: any) => React.ReactNode;
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'file';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onAdd: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  pageSize?: number;
  formFields?: FormField[];
}

interface FormData {
  [key: string]: string | number | boolean;
}

interface EditingData {
  [key: string]: string | number | boolean;
}

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onAdd,
  onUpdate,
  onDelete,
  onRowClick,
  loading = false,
  pageSize = 25,
  formFields = []
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [editingData, setEditingData] = useState<EditingData>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize
  });

  // Reset pagination when search changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({});
    setIsAddDialogOpen(false);
  };

  const handleEdit = (row: any) => {
    setEditingData(row);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      onUpdate(editingData);
      setEditingData({});
      setIsEditDialogOpen(false);
    }
  };

  const filteredData = data.filter(item =>
    Object.entries(item).some(([key, value]) =>
      columns.some(col => {
        const cellValue = col.accessorFn 
          ? col.accessorFn(item)
          : getNestedValue(item, col.accessorKey);
        return cellValue?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    )
  );

  // Calculate pagination values
  const totalPages = Math.ceil(filteredData.length / pagination.pageSize);
  const startIndex = pagination.pageIndex * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const renderCell = (column: Column, row: any) => {
    const value = column.accessorFn
      ? column.accessorFn(row)
      : getNestedValue(row, column.accessorKey);

    if (column.render) {
      return column.render(value, row);
    }

    if (column.isStatus) {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value?.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' :
          value?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      );
    }

    if (column.isNumber && value !== undefined) {
      return Number(value).toLocaleString();
    }

    if (column.icon) {
      const Icon = column.icon;
      return (
        <div className="flex items-center space-x-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      );
    }

    return value || '-';
  };

  const renderFormField = (field: FormField, value: any, onChange: (key: string, value: any) => void) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        );
      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => onChange(field.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={(checked: boolean) => onChange(field.key, checked)}
            />
            <Label htmlFor={field.key}>{field.label}</Label>
          </div>
        );
      case 'file':
        return (
          <Input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Here you would typically handle file upload
                // For now, we'll just store the file name
                onChange(field.key, file.name);
              }
            }}
            accept="image/*"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
            placeholder={field.placeholder || field.label}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        );
    }
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-4 py-4 border-t">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
          disabled={pagination.pageIndex === 0 || loading}
        >
          First
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }))}
          disabled={pagination.pageIndex === 0 || loading}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Page {pagination.pageIndex + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
          disabled={pagination.pageIndex === totalPages - 1 || loading}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPagination(prev => ({ ...prev, pageIndex: totalPages - 1 }))}
          disabled={pagination.pageIndex === totalPages - 1 || loading}
        >
          Last
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formFields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="text-sm font-medium block mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFormField(field, formData[field.key], (key, value) =>
                        setFormData(prev => ({ ...prev, [key]: value }))
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                columns.map((column) => (
                  <div key={column.accessorKey}>
                    <label className="text-sm font-medium">
                      {column.header}
                    </label>
                    <Input
                      value={String(formData[column.accessorKey] || '')}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          [column.accessorKey]: e.target.value
                        }))
                      }
                      placeholder={column.header}
                    />
                  </div>
                ))
              )}
              <Button type="submit" className="w-full">
                Add Record
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="w-72">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingData && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {formFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formFields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="text-sm font-medium block mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderFormField(field, editingData[field.key], (key, value) =>
                        setEditingData(prev => ({ ...prev, [key]: value }))
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                columns.map((column) => (
                  <div key={column.accessorKey}>
                    <label className="text-sm font-medium">
                      {column.header}
                    </label>
                    <Input
                      value={String(editingData[column.accessorKey] || '')}
                      onChange={(e) =>
                        setEditingData(prev => ({
                          ...prev,
                          [column.accessorKey]: e.target.value
                        }))
                      }
                      placeholder={column.header}
                    />
                  </div>
                ))
              )}
              <div className="flex space-x-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessorKey}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-muted-foreground">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">No results found</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow 
                  key={i}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          disabled={loading}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(row)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(row)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <PaginationControls />
      </div>
    </div>
  );
};

export default DataTable;