import React from "react";
import { cn } from "@/lib/utils";
import {
  DialogHeader,
  Dialog,
  DialogContent,
} from "@/components/ui/bigster/dialog-custom";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  contentClassName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "bg-white max-h-[90vh] overflow-x-hidden overflow-y-auto !rounded-none",
          contentClassName
        )}
      >
        <DialogHeader title={title} onClose={onClose} />
        <div className={cn("p-5 pt-0", className)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;
