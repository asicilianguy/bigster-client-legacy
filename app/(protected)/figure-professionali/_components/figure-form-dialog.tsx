// @ts-nocheck
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useCreateProfessionalFigureMutation,
  useUpdateProfessionalFigureMutation,
} from "@/lib/redux/features/professional-figures/professionalFiguresApiSlice";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import CustomDialog from "@/components/ui/bigster/CustomDialog";
import { Check } from "lucide-react";
import { UserBase as User } from "@/types/user";
import { Seniority, type ProfessionalFigureBase as ProfessionalFigure } from "@/types/professionalFigure";
import { useUserRole } from "@/hooks/use-user-role";

const figureSchema = z.object({
  nome: z.string().min(3, "Il nome è obbligatorio (min 3 caratteri)"),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR"], {
    required_error: "Il livello di seniority è obbligatorio.",
  }),
  descrizione: z
    .string()
    .min(10, "La descrizione è obbligatoria (min 10 caratteri)"),
  prerequisiti: z.string().optional(),
  reparto_id: z.string().min(1, "Il reparto è obbligatorio"),
});

export function FigureFormDialog({
  isOpen,
  onClose,
  figure,
  userData,
}: {
  isOpen: boolean;
  onClose: () => void;
  figure?: any;
  userData: User;
}) {
  const { isCEO } = useUserRole();
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    userData?.reparto_id
  );

  const [createFigure, { isLoading: isCreating }] =
    useCreateProfessionalFigureMutation();
  const [updateFigure, { isLoading: isUpdating }] =
    useUpdateProfessionalFigureMutation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // @ts-ignore — useGetDepartmentsQuery is a WIP hook not yet in codebase
  const { data: departmentsData, isLoading: isLoadingDepartments } =
    (typeof useGetDepartmentsQuery !== 'undefined' ? useGetDepartmentsQuery : () => ({}))({})

  const isEditMode = !!figure;
  const isLoading = isCreating || isUpdating;

  const form = useForm<z.infer<typeof figureSchema>>({
    resolver: zodResolver(figureSchema),
    defaultValues: {
      nome: "",
      seniority: undefined,
      descrizione: "",
      prerequisiti: "",
      reparto_id: userData?.reparto_id ? String(userData.reparto_id) : "",
    },
  });

  useEffect(() => {
    if (isEditMode && figure) {
      form.reset({
        nome: figure.nome || "",
        seniority: figure.seniority || undefined,
        descrizione: figure.descrizione || "",
        prerequisiti: figure.prerequisiti || "",
        reparto_id: figure.reparto_id ? String(figure.reparto_id) : "",
      });
      if (figure.reparto_id) {
        setSelectedDepartment(figure.reparto_id);
      }
    } else {
      form.reset({
        nome: "",
        seniority: undefined,
        descrizione: "",
        prerequisiti: "",
        reparto_id: userData?.reparto_id ? String(userData.reparto_id) : "",
      });
      setSelectedDepartment(userData?.reparto_id);
    }
  }, [figure, isEditMode, form, isOpen, userData]);

  const onSubmit = async (values: z.infer<typeof figureSchema>) => {
    const payload = {
      nome: values.nome,
      seniority: values.seniority as Seniority,
      descrizione: values.descrizione,
      prerequisiti: values.prerequisiti,
    } as any;

    try {
      if (isEditMode) {
        await updateFigure({ id: Number(figure.id), ...payload }).unwrap();
        toast.success("Figura professionale aggiornata!");
      } else {
        await createFigure(payload).unwrap();
        toast.success("Figura professionale creata!");
      }
      onClose();
    } catch (err: any) {
      const errorMsg =
        err.data?.errors?.[0]?.message ||
        err.data?.message ||
        "Si è verificato un errore.";
      toast.error(errorMsg);
    }
  };

  return (
    <CustomDialog
      title="Crea Nuova Figura Professionale"
      isOpen={isOpen}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Sviluppatore Frontend" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seniority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seniority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona seniority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="MID">Mid</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Reparto</FormLabel>
            <Controller
              name="reparto_id"
              control={form.control}
              defaultValue={
                userData.reparto_id ? String(userData.reparto_id) : ""
              }
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedDepartment(Number(value));
                  }}
                  defaultValue={
                    field.value ||
                    (userData.reparto_id ? String(userData.reparto_id) : "")
                  }
                >
                  <SelectTrigger
                    disabled={isLoadingDepartments || !isCEO}
                    className="w-full"
                  >
                    <SelectValue placeholder="Seleziona un reparto" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDepartments ? (
                      <SelectItem value="loading" disabled>
                        Caricamento...
                      </SelectItem>
                    ) : isCEO ? (
                      departmentsData?.data.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nome}
                        </SelectItem>
                      ))
                    ) : (
                      departmentsData?.data
                        .filter((dept: any) => dept.id === userData.reparto_id)
                        .map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.nome}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            <FormMessage>
              {form.formState.errors.reparto_id?.message}
            </FormMessage>
          </FormItem>

          <FormField
            control={form.control}
            name="descrizione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrivi la figura professionale, le sue responsabilità, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prerequisiti"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisiti (opzionale)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Elenca i prerequisiti tecnici e non."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-6 gap-2 flex justify-end">
            <Button type="submit" variant="secondary" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2 h-4 w-4" />}
              <Check className="h-4 w-4 mr-2" />
              Conferma
            </Button>
          </div>
        </form>
      </Form>
    </CustomDialog>
  );
}
