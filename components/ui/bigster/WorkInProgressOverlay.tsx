import React from "react";
import { AlertTriangle } from "lucide-react";

const WorkInProgressOverlay = ({ message = "LAVORI IN CORSO" }) => {

  const WorkInProgressItem = () => (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <AlertTriangle className="h-16 w-16" />
      <h2 className="text-4xl font-bold tracking-wider">{message}</h2>
      <div className="h-1 w-32 bg-current my-2" />
      <p className="text-xl max-w-md">
        Questa sezione è attualmente in fase di sviluppo
      </p>
    </div>
  );

  return (
    <div
      className="absolute inset-0 z-50 overflow-hidden"
      style={{
        backgroundColor: "#efeac7",
        opacity: 0.85,
        color: "#6c4e06",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">

        {Array.from({ length: 20 }, (_, index) => (
          <WorkInProgressItem key={index} />
        ))}
      </div>
    </div>
  );
};

export default WorkInProgressOverlay;
