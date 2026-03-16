// @ts-nocheck
"use client";

import { useState, useMemo } from "react";
import {
  useGetAllProfessionalFiguresQuery,
} from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Calendar, PlusIcon } from "lucide-react";
import { FigureFormDialog } from "./_components/figure-form-dialog";
import { motion } from "framer-motion";
import { FiltersSectionProfessionalFigures } from "@/components/ui/bigster/FiltersSectionProfessionalFiguresProps";
import { useUserRole } from "@/hooks/use-user-role";
import { UserBase as User } from "@/types/user";

export default function GestioneFigureProfessionaliPage() {
  const { isResponsabileHR: isResponsabile, user } = useUserRole();

  const { data, error, isLoading } = useGetAllProfessionalFiguresQuery();

  console.log({ data });

  const departmentsData: any = undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [seniorityFilter, setSeniorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("alphabetical");

  const filteredFigures = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (figure) =>
          figure.nome.toLowerCase().includes(query) ||
          (figure.reparto?.nome &&
            figure.reparto.nome.toLowerCase().includes(query))
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (figure) => figure.reparto_id.toString() === departmentFilter
      );
    }

    if (seniorityFilter !== "all") {
      filtered = filtered.filter(
        (figure) => figure.seniority === seniorityFilter
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.data_creazione).getTime() -
          new Date(a.data_creazione).getTime()
        );
      } else if (sortBy === "alphabetical") {
        return a.nome.localeCompare(b.nome);
      } else if (sortBy === "department") {
        return (a.reparto?.nome || "").localeCompare(b.reparto?.nome || "");
      }
      return 0;
    });
  }, [data, searchQuery, departmentFilter, seniorityFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Errore nel caricamento delle figure professionali.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">

      <motion.div
        style={{
          boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
        }}
        initial={{ opacity: 0, transform: "translateY(-20px)" }}
        animate={{ opacity: 1, transform: "translateY(0)" }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          opacity: { duration: 0.2 },
          transform: { type: "spring", stiffness: 300, damping: 30 },
        }}
        className="p-4 sm:p-6 !py-[10px] overflow-hidden border-0 sticky top[60px] z-10 shadow-lg flex bg-bigster-background items-center justify-between will-change-transform"
      >
        <FiltersSectionProfessionalFigures
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          departmentFilter={departmentFilter}
          setDepartmentFilter={setDepartmentFilter}
          seniorityFilter={seniorityFilter}
          setSeniorityFilter={setSeniorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          departmentsData={departmentsData}
        />

        {isResponsabile && (
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2.5 px-2.5 py-2.5 border-none font-medium text-[15px] bg-bigster-primary text-bigster-text"
            >
              <PlusIcon className="h-4 w-4 font-bold" />
              Nuova Figura Professionale
            </button>
            <FigureFormDialog
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              userData={user as User}
            />
          </div>
        )}
      </motion.div>

      <div className="animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5 pt-0">
          {filteredFigures.length > 0 ? (
            filteredFigures.map((figure, index) => (
              <motion.div
                key={figure.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                className="w-full h-full"
              >
                <Card
                  className="rounded-none w-full h-full transition-all duration-300 hover:shadow-xl border-0 overflow-hidden group flex flex-col"
                  style={{
                    background: `white`,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <CardContent className="p-6 flex flex-col h-full">

                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant="outline"
                        className="font-semibold text-xs px-3 py-1 border-2 whitespace-nowrap text-bigster-text"
                        style={{
                          backgroundColor: "white",
                          borderColor: "#6c4e06",
                        }}
                      >
                        <Users className="h-3 w-3 mr-1 inline" />
                        {figure.seniority}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3">
                      {figure.nome}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 flex-shrink-0 text-gray-500" />
                        <span className="truncate">
                          {figure.reparto?.nome || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-500" />
                        <span>
                          {new Date(figure.data_creazione).toLocaleDateString(
                            "it-IT"
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between bg-bigster-background rounded-lg p-4 mb-0">
                        <div className="text-center flex-1">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-500 font-medium">
                              Figura professionale
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-bigster-text truncate">
                            {figure.seniority}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex justify-center items-center h-24 bg-white rounded-lg border p-6">
              Nessuna figura professionale trovata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
