"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateAnnouncementMutation } from "@/lib/redux/features/announcements/announcementsApiSlice";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Check, PlusIcon } from "lucide-react";
import CustomDialog from "@/components/ui/bigster/CustomDialog";

const announcementSchema = z.object({
  titolo: z.string().min(5, "Il titolo è obbligatorio (min 5 caratteri)"),
  descrizione: z
    .string()
    .min(10, "La descrizione è obbligatoria (min 10 caratteri)"),
  piattaforma: z.enum(["LINKEDIN", "INDEED", "ALTRO"], {
    required_error: "La piattaforma di pubblicazione è obbligatoria.",
  }),
});

export function CreateAnnouncementDialog({
  selectionId,
}: {
  selectionId: number;
}) {
  const [open, setOpen] = useState(false);
  const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      titolo: "",
      descrizione: "",
      piattaforma: "LINKEDIN",
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    try {
      await (createAnnouncement as any)({
        ...values,
        selezione_id: selectionId,
      }).unwrap();
      toast.success("Annuncio creato con successo!");
      setOpen(false);
      form.reset();
    } catch (err: any) {
      toast.error(err.data?.message || "Errore nella creazione dell'annuncio.");
    }
  };

  return (
    <>
      <div className="w-full flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4 font-bold" />
          Crea Annuncio
        </Button>
      </div>
      <CustomDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Crea Nuovo Annuncio"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titolo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Es. Sviluppatore Frontend Senior"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descrizione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi la posizione, i requisiti, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="piattaforma"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Piattaforma di Pubblicazione</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una piattaforma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                      <SelectItem value="INDEED">Indeed</SelectItem>
                      <SelectItem value="ALTRO">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="secondary" type="submit" disabled={isLoading}>
                <Check className="h-4 w-4" />
                {isLoading ? <Spinner /> : "Conferma"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </CustomDialog>
    </>
  );
}
