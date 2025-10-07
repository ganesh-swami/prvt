import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExportOptions } from '@/components/common/ExportOptions';
import { useDraft } from '@/contexts/DraftContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Save, 
  FileText, 
  Trash2, 
  Download, 
  Calendar,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';

const DraftsAndPlans: React.FC = () => {
  const [draftName, setDraftName] = useState('');
  const { 
    draftData, 
    savedDrafts, 
    saveDraft, 
    loadDraft, 
    deleteDraft, 
    isLoading, 
    error 
  } = useDraft();
  const { user } = useAuth();

  const handleSaveDraft = async () => {
    if (!draftName.trim()) {
      alert('Please enter a draft name');
      return;
    }
    
    await saveDraft(draftName);
    setDraftName('');
  };

  const handleLoadDraft = async (draftId: string) => {
    if (confirm('Loading this draft will replace your current work. Continue?')) {
      await loadDraft(draftId);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      await deleteDraft(draftId);
    }
  };

  const getModuleDataSummary = () => {
    const modules = Object.keys(draftData);
    const totalFields = modules.reduce((total, module) => {
      return total + Object.keys(draftData[module] || {}).length;
    }, 0);
    
    return { modules: modules.length, fields: totalFields };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-gray-600">Please log in to access your drafts and plans.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = getModuleDataSummary();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drafts and Plans</h1>
          <p className="text-gray-600 mt-2">
            Manage your business plan drafts and data across all modules
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {summary.modules} modules • {summary.fields} fields
          </Badge>
          <ExportOptions 
            data={draftData} 
            filename="business-plan-draft"
            moduleName="Business Plan Draft"
          />
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </CardContent>
        </Card>
      )}

      {/* Current Session Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Session Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.modules}</div>
              <div className="text-sm text-gray-600">Modules with Data</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.fields}</div>
              <div className="text-sm text-gray-600">Total Fields</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{savedDrafts.length}</div>
              <div className="text-sm text-gray-600">Saved Drafts</div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Input
              placeholder="Enter draft name..."
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleSaveDraft}
              disabled={isLoading || !draftName.trim()}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Drafts */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          {savedDrafts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No saved drafts yet. Save your current work to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedDrafts.map((draft) => (
                <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-semibold">{draft.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(draft.created_at)}
                      </span>
                      <span>
                        {Object.keys(draft.data).length} modules
                      </span>
                    </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button
                       variant="default"
                       size="sm"
                       onClick={() => handleLoadDraft(draft.id)}
                       disabled={isLoading}
                       className="flex items-center gap-1"
                     >
                       Continue
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDeleteDraft(draft.id)}
                       disabled={isLoading}
                       className="text-red-600 hover:text-red-700"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default DraftsAndPlans;