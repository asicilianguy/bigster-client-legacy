import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SelectionWithRelations } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle } from "lucide-react";

interface SelectionApprovalCardProps {
  selection: SelectionWithRelations;
  onApprove: (id: number) => Promise<any>;
  index?: number;
}

export function SelectionApprovalCard({
  selection,
  onApprove,
  index = 0,
}: SelectionApprovalCardProps) {
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(selection.id);
    } catch (error) {
      console.error("Error approving selection:", error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1 + 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Card className="shadow-sm border-l-4 border-l-yellow-500 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-base">{selection.titolo}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 border-yellow-300"
                >
                  In attesa
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Reparto: {(selection as any).reparto?.nome}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Creata da: {(selection as any).responsabile?.nome}{" "}
                {(selection as any).responsabile?.cognome} il{" "}
                {new Date(selection.data_creazione).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/selezioni/${selection.id}`}>Dettagli</Link>
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isApproving ? (
                  <Spinner className="h-4 w-4 mr-1" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                Approva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
