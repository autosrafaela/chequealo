import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReviewResponseProps {
  reviewId: string;
  professionalId: string;
  onResponseAdded: () => void;
  existingResponse?: string;
  isOwner: boolean;
}

export const ReviewResponseComponent = ({ 
  reviewId, 
  professionalId, 
  onResponseAdded, 
  existingResponse,
  isOwner 
}: ReviewResponseProps) => {
  const [isResponding, setIsResponding] = useState(false);
  const [responseText, setResponseText] = useState(existingResponse || '');

  const submitResponse = async () => {
    if (!responseText.trim()) {
      toast.error('Por favor escribe una respuesta');
      return;
    }

    try {
      const { error } = await supabase
        .from('review_responses')
        .insert({
          review_id: reviewId,
          professional_id: professionalId,
          response: responseText.trim()
        });

      if (error) throw error;

      toast.success('Respuesta enviada exitosamente');
      setIsResponding(false);
      setResponseText('');
      onResponseAdded();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Error al enviar la respuesta');
    }
  };

  if (!isOwner || existingResponse) {
    // Show existing response if available
    if (existingResponse) {
      return (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Respuesta del profesional:</span>
          </div>
          <p className="text-sm text-blue-800">{existingResponse}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <Dialog open={isResponding} onOpenChange={setIsResponding}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2">
          <MessageSquare className="h-4 w-4 mr-2" />
          Responder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Responder a la Opinión</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="response">Tu Respuesta</Label>
            <Textarea
              id="response"
              placeholder="Escribe tu respuesta a esta opinión..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={submitResponse} className="flex-1">
              Enviar Respuesta
            </Button>
            <Button variant="outline" onClick={() => {
              setIsResponding(false);
              setResponseText('');
            }}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};