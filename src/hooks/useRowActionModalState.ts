"use client";

import { useCallback, useMemo, useState } from "react";

interface UseRowActionModalStateOptions {
  enableView?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;
}

// Replaces the three useState pairs every table would otherwise repeat, and
// makes one behaviour consistent: closing a dialog clears its item, so a
// reopened dialog never flashes the previous row's data.
export const useRowActionModalState = <TData,>({
  enableView = true,
  enableEdit = true,
  enableDelete = true,
}: UseRowActionModalStateOptions = {}) => {
  const [viewingItem, setViewingItem] = useState<TData | null>(null);
  const [editingItem, setEditingItem] = useState<TData | null>(null);
  const [deletingItem, setDeletingItem] = useState<TData | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleView = useCallback((item: TData) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  }, []);

  const handleEdit = useCallback((item: TData) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((item: TData) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const onViewOpenChange = useCallback((open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) setViewingItem(null);
  }, []);

  const onEditOpenChange = useCallback((open: boolean) => {
    setIsEditModalOpen(open);
    if (!open) setEditingItem(null);
  }, []);

  const onDeleteOpenChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open) setDeletingItem(null);
  }, []);

  // Omitting a callback is what makes DataTable hide that menu item.
  const tableActions = useMemo(() => {
    return {
      onView: enableView ? handleView : undefined,
      onEdit: enableEdit ? handleEdit : undefined,
      onDelete: enableDelete ? handleDelete : undefined,
    };
  }, [enableDelete, enableEdit, enableView, handleDelete, handleEdit, handleView]);

  return {
    viewingItem,
    editingItem,
    deletingItem,
    isViewDialogOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    onViewOpenChange,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  };
};
