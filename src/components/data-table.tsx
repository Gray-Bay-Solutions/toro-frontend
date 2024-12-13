"use client"

import React from 'react';
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useState } from "react";

interface Column {
  header: string;
  accessorKey: string;
  icon?: any;
  isNumber?: boolean;
  isStatus?: boolean;
  render?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onAdd: (data: any) => void;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  loading?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ 
  columns, 
  data, 
  onAdd, 
  onUpdate, 
  onDelete,
  loading = false
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingData, setEditingData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      setEditingData(null);
      setIsEditDialogOpen(false);
    }
  };

  const filteredData = data.filter(item => 
    Object.entries(item).some(([key, value]) => 
      columns.some(col => col.accessorKey === key && 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const renderCell = (column: Column, value: any) => {
    if (column.render) {
      return column.render(value);
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

    if (column.isNumber) {
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

    return value;
  };

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {columns.map((column) => (
                <div key={column.accessorKey}>
                  <label className="text-sm font-medium">
                    {column.header}
                  </label>
                  <Input
                    value={formData[column.accessorKey] || ''}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        [column.accessorKey]: e.target.value
                      }))
                    }
                    placeholder={column.header}
                  />
                </div>
              ))}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          {editingData && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {columns.map((column) => (
                <div key={column.accessorKey}>
                  <label className="text-sm font-medium">
                    {column.header}
                  </label>
                  <Input
                    value={editingData[column.accessorKey] || ''}
                    onChange={(e) => 
                      setEditingData(prev => ({
                        ...prev,
                        [column.accessorKey]: e.target.value
                      }))
                    }
                    placeholder={column.header}
                  />
                </div>
              ))}
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
              filteredData.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey}>
                      {renderCell(column, row[column.accessorKey])}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
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
      </div>
    </div>
  );
};

export default DataTable;