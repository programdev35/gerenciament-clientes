
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeleteConfirmationProps {
  customerName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirmation = ({ customerName, onConfirm, onClose }: DeleteConfirmationProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Confirmar Exclusão
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700">
            Tem certeza que deseja excluir o cliente{' '}
            <strong className="text-slate-900">"{customerName}"</strong>?
          </p>
          <p className="text-sm text-slate-500">
            Esta ação não pode ser desfeita. Todos os dados do cliente serão permanentemente removidos.
          </p>
          
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sim, Excluir
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteConfirmation;
