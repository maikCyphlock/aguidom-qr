// En un archivo de utilidades, por ejemplo, lib/utils/errorToasts.ts
import { toast } from "sonner";
import { XCircle } from "lucide-react";

export function showErrorToast(message: string) {
  toast.custom((t) => (
    <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg shadow-lg flex items-start space-x-4 border border-red-200 dark:border-red-800">
      <XCircle className="h-6 w-6 text-red-500" />
      <div>
        <h4 className="font-semibold text-lg text-red-800 dark:text-red-200">
          Error detectado
        </h4>
        <p className="text-red-600 dark:text-red-400 mt-1">{message}</p>
        <div className="mt-4">
          <button
            onClick={() => toast.dismiss(t)}
            className="text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  ));
}