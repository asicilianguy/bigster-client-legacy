"use client";

import { toast } from "sonner";
import { CheckCircle2, XCircle, Info, AlertCircle } from "lucide-react";
import type { ExternalToast } from "sonner";
import React from "react";

type NotifyType = "success" | "error" | "info" | "warning";

interface NotifyOptions extends ExternalToast {
  type?: NotifyType;
  icon?: React.ReactNode;
}

interface RichNotifyOptions extends NotifyOptions {
  actionLabel?: string;
  actionOnClick?: () => void;
  cancelLabel?: string;
}

export function useNotify() {
  const getIcon = (type: NotifyType): React.ReactNode => {
    const iconProps = { className: "h-5 w-5 shrink-0", strokeWidth: 2 };

    switch (type) {
      case "success":
        return React.createElement(CheckCircle2, {
          ...iconProps,
          className: "h-5 w-5 shrink-0 text-green-600",
        });
      case "error":
        return React.createElement(XCircle, {
          ...iconProps,
          className: "h-5 w-5 shrink-0 text-red-600",
        });
      case "info":
        return React.createElement(Info, {
          ...iconProps,
          className: "h-5 w-5 shrink-0 text-blue-600",
        });
      case "warning":
        return React.createElement(AlertCircle, {
          ...iconProps,
          className: "h-5 w-5 shrink-0 text-yellow-600",
        });
      default:
        return null;
    }
  };

  const standard = (
    message: string,
    description?: string,
    options?: NotifyOptions
  ) => {
    const { type = "info", icon, ...restOptions } = options || {};

    return toast(message, {
      description,
      icon: icon || getIcon(type),
      className: type,
      duration: 4000,
      ...restOptions,
    });
  };

  const rich = (
    message: string,
    description?: string,
    options?: RichNotifyOptions
  ) => {
    const {
      type = "info",
      icon,
      actionLabel,
      actionOnClick,
      cancelLabel,
      ...restOptions
    } = options || {};

    return toast(message, {
      description,
      icon: icon || getIcon(type),
      className: type,
      duration: 6000,
      action: actionLabel
        ? {
            label: actionLabel,
            onClick: actionOnClick || (() => {}),
          }
        : undefined,
      cancel: cancelLabel
        ? {
            label: cancelLabel,
            onClick: () => {},
          }
        : undefined,
      ...restOptions,
    });
  };

  const success = (
    message: string,
    description?: string,
    options?: Omit<NotifyOptions, "type">
  ) => standard(message, description, { ...options, type: "success" });

  const error = (
    message: string,
    description?: string,
    options?: Omit<NotifyOptions, "type">
  ) => standard(message, description, { ...options, type: "error" });

  const info = (
    message: string,
    description?: string,
    options?: Omit<NotifyOptions, "type">
  ) => standard(message, description, { ...options, type: "info" });

  const warning = (
    message: string,
    description?: string,
    options?: Omit<NotifyOptions, "type">
  ) => standard(message, description, { ...options, type: "warning" });

  const richSuccess = (
    message: string,
    description?: string,
    options?: Omit<RichNotifyOptions, "type">
  ) => rich(message, description, { ...options, type: "success" });

  const richError = (
    message: string,
    description?: string,
    options?: Omit<RichNotifyOptions, "type">
  ) => rich(message, description, { ...options, type: "error" });

  const richInfo = (
    message: string,
    description?: string,
    options?: Omit<RichNotifyOptions, "type">
  ) => rich(message, description, { ...options, type: "info" });

  const richWarning = (
    message: string,
    description?: string,
    options?: Omit<RichNotifyOptions, "type">
  ) => rich(message, description, { ...options, type: "warning" });

  const promise = <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  };

  return {

    success,
    error,
    info,
    warning,

    richSuccess,
    richError,
    richInfo,
    richWarning,

    standard,
    rich,

    promise,

    dismiss: toast.dismiss,
    dismissAll: () => toast.dismiss(),
  };
}
