import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SaveDraftButtonProps {
  moduleKey: string;
  moduleData: any;
  className?: string;
}

const SaveDraftButton: React.FC<SaveDraftButtonProps> = ({ 
  moduleKey, 
  moduleData, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { updateDraft, saveDraft } = useDraft();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save drafts.",
        variant: "destructive",
      });
      return;
    }

    if (!draftName.trim()) {
      toast({
        title: "Draft Name Required",
        description: "Please enter a name for your draft.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Update the draft context with current module data
      Object.keys(moduleData).forEach(fieldKey => {
        updateDraft(moduleKey, fieldKey, moduleData[fieldKey]);
      });

      // Save the draft
      await saveDraft(draftName);
      
      toast({
        title: "Draft Saved",
        description: `Your ${moduleKey} draft has been saved successfully.`,
      });
      
      setIsOpen(false);
      setDraftName('');
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Save className="h-4 w-4 mr-2" />
          Save and Continue Later
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Draft</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="draftName">Draft Name</Label>
            <Input
              id="draftName"
              placeholder="Enter a name for your draft..."
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !draftName.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveDraftButton;