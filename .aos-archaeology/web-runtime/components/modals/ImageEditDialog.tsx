"use client";

import * as React from "react";
import { EntityModal } from "@/components/modals/EntityModal";
import { ImagePicker } from "@/components/ui/image-picker";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string | null;
  onSave: (url: string | null) => void;
  title?: string;
  disabled?: boolean;
  cropShape?: 'circle' | 'square' | 'none';
}

export function ImageEditDialog({
  open,
  onOpenChange,
  value,
  onSave,
  title = "Edit Photo",
  disabled = false,
  cropShape = 'none',
}: ImageEditDialogProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = React.useState<string | null>(value);

  // Sync internal state when value prop changes
  React.useEffect(() => {
    setImageUrl(value);
  }, [value]);

  const handleSave = () => {
    onSave(imageUrl);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setImageUrl(value);
    onOpenChange(false);
  };

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="person"
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={disabled}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ImagePicker
          value={imageUrl}
          onChange={(url) => setImageUrl(url || null)}
          onError={(error) => {
            toast({
              title: "Image upload failed",
              description: error,
              variant: "error",
            });
          }}
          disabled={disabled}
          cropShape={cropShape}
        />
        <p className="text-xs text-warm-600">
          Upload or link to a photo
        </p>
      </div>
    </EntityModal>
  );
}
