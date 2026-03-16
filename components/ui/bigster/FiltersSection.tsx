"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  Users,
  FileText,
  X,
  Filter,
} from "lucide-react";
import { UserResponse } from "@/types/user";
import { useUserRole } from "@/hooks/use-user-role";

interface FiltersSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  figureFilter: string;
  setFigureFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  departmentsData?: any;
  professionalFiguresData?: any;
  user: UserResponse | null;
}

export function FiltersSection({
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  figureFilter,
  setFigureFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  departmentsData,
  professionalFiguresData,
  user,
}: FiltersSectionProps) {
  const { isCEO, hasFullAccess } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasActiveFilters =
    departmentFilter !== "all" ||
    figureFilter !== "all" ||
    statusFilter !== "all" ||
    searchQuery;

  const clearAllFilters = () => {
    setDepartmentFilter("all");
    setFigureFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (departmentFilter !== "all") count++;
    if (figureFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    return count;
  };

  return (
    <div>
      <div className="">
        <div className="flex gap-8 items-center">

          <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#6c4e06" }}>
            Selezioni
          </h3>
          <div className="relative">
            <span className="absolute top-2.5 left-2.5">
              <Search width={18} height={18} color="#6c4e06" />
            </span>
            <input
              placeholder="Cerca per titolo, figura professionale o reparto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none p-2.5 pl-10 w-[480px] font-medium text-[15px] text-[#6c4e06] placeholder-[#6c4e06] focus:outline-none focus:ring-0 focus:shadow-none"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="relative !border-none font-medium px-3 py-2.5 rounded-none bg-transparent"
                style={{
                  borderColor: "transparent",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "#6c4e06",
                }}
              >
                <Filter className="h-5 w-5" />
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader
                title="Filtra e Ordina"
                onClose={() => setIsDialogOpen(false)}
              />

              <div className="space-y-5 p-5 pt-0">

                <div className="space-y-2">
                  <label
                    className="text-sm font-bold"
                    style={{ color: "#6c4e06" }}
                  >
                    Ordina per
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={sortBy === "recent" ? "default" : "outline"}
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "recent"
                          ? "bg-bigster-primary text-bigster-text border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("recent")}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Più recenti</span>
                    </Button>
                    <Button
                      variant={
                        sortBy === "applications" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "applications"
                          ? "bg-bigster-primary text-bigster-text border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("applications")}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Più candidature</span>
                    </Button>
                    <Button
                      variant={
                        sortBy === "alphabetical" ? "default" : "outline"
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-md ${
                        sortBy === "alphabetical"
                          ? "bg-bigster-primary text-bigster-text border border-yellow-200"
                          : "border border-gray-200"
                      }`}
                      onClick={() => setSortBy("alphabetical")}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Nome (A-Z)</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Reparto
                      </label>
                      {departmentFilter !== "all" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setDepartmentFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                        disabled={!hasFullAccess}
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutti i reparti" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutti i reparti</SelectItem>
                          {departmentsData?.data.map((dept: any) => (
                            <SelectItem
                              key={dept.id}
                              value={dept.id.toString()}
                            >
                              {dept.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Figura Professionale
                      </label>
                      {figureFilter !== "all" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-xs"
                          onClick={() => setFigureFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={figureFilter}
                        onValueChange={setFigureFilter}
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutte le figure" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutte le figure</SelectItem>
                          {professionalFiguresData?.data.map((figure: any) => (
                            <SelectItem
                              key={figure.id}
                              value={figure.id.toString()}
                            >
                              {figure.nome} ({figure.seniority})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="text-sm font-bold"
                        style={{ color: "#6c4e06" }}
                      >
                        Stato
                      </label>
                      {statusFilter !== "all" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 px-2 text-xs"
                          onClick={() => setStatusFilter("all")}
                        >
                          <X className="h-3 w-3 mr-1" /> Rimuovi filtro
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger
                          className="border rounded-md shadow-sm transition-all duration-200 hover:shadow-md py-2"
                          style={{
                            borderColor: "rgba(108, 78, 6, 0.2)",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                        >
                          <SelectValue placeholder="Tutti gli stati" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border rounded-md">
                          <SelectItem value="all">Tutti gli stati</SelectItem>

                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 w-full mt-4 rounded-md font-semibold shadow-sm hover:shadow-md transition-all duration-200 border"
                    style={{
                      borderColor: "#ef4444",
                      color: "#ef4444",
                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                    }}
                    onClick={() => {
                      clearAllFilters();
                      setIsDialogOpen(false);
                    }}
                  >
                    <X className="h-4 w-4" /> Cancella tutti i filtri
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
