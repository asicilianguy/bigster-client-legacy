"use client";

import Breadcrumb from "@/components/ui/bigster/BreadCrumb";
import { SelectionDetail } from "@/types/selection";

interface SelectionHeaderProps {
  selection: SelectionDetail;
}

export function SelectionHeader({ selection }: SelectionHeaderProps) {
  return <Breadcrumb title={selection.titolo} />;
}

export default SelectionHeader;
