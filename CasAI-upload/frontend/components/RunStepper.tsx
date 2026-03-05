"use client";

interface RunStepperProps {
  status: "CREATED" | "RUNNING" | "FAILED" | "COMPLETE";
}

const steps = [
  { id: "CREATED", label: "Created" },
  { id: "RUNNING", label: "Running" },
  { id: "COMPLETE", label: "Complete" },
];

export default function RunStepper({ status }: RunStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === status);
  const isFailed = status === "FAILED";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex && !isFailed;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : isFailed && isCurrent
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isActive || (isFailed && isCurrent) ? (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    isActive || (isFailed && isCurrent)
                      ? "text-gray-900 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {isFailed && isCurrent ? "Failed" : step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
