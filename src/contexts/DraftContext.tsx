// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from './AuthContext';

// interface DraftData {
//   [moduleId: string]: {
//     [fieldId: string]: any;
//   };
// }

// interface SavedDraft {
//   id: string;
//   name: string;
//   data: DraftData;
//   created_at: string;
//   updated_at: string;
// }

// interface DraftContextType {
//   draftData: DraftData;
//   updateDraft: (moduleId: string, fieldId: string, value: any) => void;
//   getDraft: (moduleId: string, fieldId: string) => any;
//   clearDraft: (moduleId: string) => void;
//   saveDraft: (name: string, data?: any) => Promise<void>;
//   loadDraft: (draftId: string) => Promise<any>;
//   deleteDraft: (draftId: string) => Promise<void>;
//   savedDrafts: SavedDraft[];
//   isLoading: boolean;
//   error: string | null;
//   // Enhanced draft functionality
//   saveModuleDraft: (moduleKey: string, data: any) => Promise<void>;
//   loadModuleDraft: (moduleKey: string) => Promise<any>;
//   getVersions: (moduleKey: string) => Promise<SavedDraft[]>;
// }

// const DraftContext = createContext<DraftContextType | undefined>(undefined);

// export const DraftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [draftData, setDraftData] = useState<DraftData>({});
//   const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { user } = useAuth();

//   // Load saved drafts when user logs in
//   useEffect(() => {
//     if (user) {
//       loadSavedDrafts();
//     } else {
//       setSavedDrafts([]);
//       setDraftData({});
//     }
//   }, [user]);

//   const loadSavedDrafts = async () => {
//     if (!user) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const { data, error } = await supabase
//         .from('drafts')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (error) throw error;
//       setSavedDrafts(data || []);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load drafts');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const updateDraft = (moduleId: string, fieldId: string, value: any) => {
//     setDraftData(prev => ({
//       ...prev,
//       [moduleId]: {
//         ...prev[moduleId],
//         [fieldId]: value
//       }
//     }));
//   };

//   const getDraft = (moduleId: string, fieldId: string) => {
//     return draftData[moduleId]?.[fieldId];
//   };

//   const clearDraft = (moduleId: string) => {
//     setDraftData(prev => {
//       const newData = { ...prev };
//       delete newData[moduleId];
//       return newData;
//     });
//   };

//   const saveDraft = async (name: string) => {
//     if (!user) {
//       setError('Must be logged in to save drafts');
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//       const { data, error } = await supabase
//         .from('drafts')
//         .insert({
//           user_id: user.id,
//           name,
//           data: draftData
//         })
//         .select()
//         .single();

//       if (error) throw error;

//       setSavedDrafts(prev => [data, ...prev]);
//       alert('Draft saved successfully!');
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Failed to save draft';
//       setError(errorMsg);
//       alert(`Error: ${errorMsg}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadDraft = async (draftId: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const { data, error } = await supabase
//         .from('drafts')
//         .select('*')
//         .eq('id', draftId)
//         .single();

//       if (error) throw error;

//       setDraftData(data.data);
//       alert('Draft loaded successfully!');
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Failed to load draft';
//       setError(errorMsg);
//       alert(`Error: ${errorMsg}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteDraft = async (draftId: string) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const { error } = await supabase
//         .from('drafts')
//         .delete()
//         .eq('id', draftId);

//       if (error) throw error;

//       setSavedDrafts(prev => prev.filter(draft => draft.id !== draftId));
//       alert('Draft deleted successfully!');
//     } catch (err) {
//       const errorMsg = err instanceof Error ? err.message : 'Failed to delete draft';
//       setError(errorMsg);
//       alert(`Error: ${errorMsg}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <DraftContext.Provider value={{
//       draftData,
//       updateDraft,
//       getDraft,
//       clearDraft,
//       saveDraft,
//       loadDraft,
//       deleteDraft,
//       savedDrafts,
//       isLoading,
//       error
//     }}>
//       {children}
//     </DraftContext.Provider>
//   );
// };

// export const useDraft = () => {
//   const context = useContext(DraftContext);
//   if (!context) {
//     throw new Error('useDraft must be used within a DraftProvider');
//   }
//   return context;
// };

// src/contexts/DraftContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DraftData {
  [moduleId: string]: { [fieldId: string]: any };
}

interface SavedDraft {
  id: string;
  name: string;
  module_key?: string;
  data: DraftData;
  version: number;
  is_auto_save: boolean;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

interface DraftVersion {
  id: string;
  draft_id: string;
  version: number;
  data: DraftData;
  created_at: string;
  change_summary?: string;
}

interface DraftContextType {
  draftData: DraftData;
  updateDraft: (moduleId: string, fieldId: string, value: any) => void;
  getDraft: (moduleId: string, fieldId: string) => any;
  clearDraft: (moduleId: string) => void;
  saveDraft: (name: string, projectId?: string) => Promise<void>;
  loadDraft: (draftId: string) => Promise<any>;
  deleteDraft: (draftId: string) => Promise<void>;
  savedDrafts: SavedDraft[];
  isLoading: boolean;
  error: string | null;
  // Enhanced functionality
  saveModuleDraft: (moduleKey: string, data: any, projectId?: string, autoSave?: boolean) => Promise<void>;
  loadModuleDraft: (moduleKey: string, projectId?: string) => Promise<any>;
  getModuleDraftVersions: (moduleKey: string, projectId?: string) => Promise<DraftVersion[]>;
  restoreVersion: (versionId: string) => Promise<void>;
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
}

const DraftContext = createContext<DraftContextType | undefined>(undefined);

export const DraftProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [draftData, setDraftData] = useState<DraftData>({});
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSavedDrafts();
    } else {
      setSavedDrafts([]);
      setDraftData({});
    }
  }, [user]);

  const loadSavedDrafts = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedDrafts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drafts");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraft = (moduleId: string, fieldId: string, value: any) => {
    setDraftData((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [fieldId]: value },
    }));
  };

  const getDraft = (moduleId: string, fieldId: string) => {
    return draftData[moduleId]?.[fieldId];
  };

  const clearDraft = (moduleId: string) => {
    setDraftData((prev) => {
      const newData = { ...prev };
      delete newData[moduleId];
      return newData;
    });
  };

  const saveDraft = async (name: string, projectId?: string) => {
    if (!user) {
      const errorMsg = "Must be logged in to save drafts";
      setError(errorMsg);
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("drafts")
        .insert({
          user_id: user.id,
          name,
          data: draftData,
          project_id: projectId,
          version: 1,
          is_auto_save: false,
        })
        .select()
        .single();
      if (error) throw error;
      setSavedDrafts((prev) => [data, ...prev]);
      toast({
        title: "Draft Saved",
        description: `"${name}" has been saved successfully.`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save draft";
      setError(errorMsg);
      toast({
        title: "Save Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDraft = async (draftId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("id", draftId)
        .single();
      if (error) throw error;
      setDraftData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load draft");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("drafts")
        .delete()
        .eq("id", draftId);
      if (error) throw error;
      setSavedDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
      toast({
        title: "Draft Deleted",
        description: "Draft has been deleted successfully.",
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete draft";
      setError(errorMsg);
      toast({
        title: "Delete Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced module-specific functionality
  const saveModuleDraft = async (
    moduleKey: string, 
    data: any, 
    projectId?: string, 
    autoSave: boolean = false
  ) => {
    if (!user) {
      const errorMsg = "Must be logged in to save drafts";
      setError(errorMsg);
      if (!autoSave) {
        toast({
          title: "Authentication Required",
          description: errorMsg,
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Check if module draft already exists
      const { data: existingDraft } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_key", moduleKey)
        .eq("project_id", projectId || null)
        .eq("is_auto_save", autoSave)
        .single();

      if (existingDraft) {
        // Update existing draft and create version
        const newVersion = existingDraft.version + 1;
        
        // Save version history
        await supabase
          .from("draft_versions")
          .insert({
            draft_id: existingDraft.id,
            version: existingDraft.version,
            data: existingDraft.data,
            change_summary: autoSave ? "Auto-save" : "Manual save",
          });

        // Update draft
        const { data: updatedDraft, error } = await supabase
          .from("drafts")
          .update({
            data,
            version: newVersion,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        
        setSavedDrafts((prev) => 
          prev.map((draft) => 
            draft.id === existingDraft.id ? updatedDraft : draft
          )
        );
      } else {
        // Create new draft
        const { data: newDraft, error } = await supabase
          .from("drafts")
          .insert({
            user_id: user.id,
            name: autoSave ? `${moduleKey} (Auto-save)` : moduleKey,
            module_key: moduleKey,
            data,
            project_id: projectId,
            version: 1,
            is_auto_save: autoSave,
          })
          .select()
          .single();

        if (error) throw error;
        setSavedDrafts((prev) => [newDraft, ...prev]);
      }

      if (!autoSave) {
        toast({
          title: "Module Draft Saved",
          description: `${moduleKey} draft has been saved successfully.`,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save module draft";
      setError(errorMsg);
      if (!autoSave) {
        toast({
          title: "Save Failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadModuleDraft = async (moduleKey: string, projectId?: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_key", moduleKey)
        .eq("project_id", projectId || null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load module draft";
      setError(errorMsg);
      toast({
        title: "Load Failed",
        description: errorMsg,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleDraftVersions = async (moduleKey: string, projectId?: string): Promise<DraftVersion[]> => {
    if (!user) return [];
    
    try {
      const { data: draft } = await supabase
        .from("drafts")
        .select("id")
        .eq("user_id", user.id)
        .eq("module_key", moduleKey)
        .eq("project_id", projectId || null)
        .single();

      if (!draft) return [];

      const { data: versions, error } = await supabase
        .from("draft_versions")
        .select("*")
        .eq("draft_id", draft.id)
        .order("version", { ascending: false });

      if (error) throw error;
      return versions || [];
    } catch (err) {
      console.error("Failed to get draft versions:", err);
      return [];
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: version, error: versionError } = await supabase
        .from("draft_versions")
        .select("*, drafts!inner(*)")
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Update current draft with version data
      const { error: updateError } = await supabase
        .from("drafts")
        .update({
          data: version.data,
          version: version.drafts.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", version.draft_id);

      if (updateError) throw updateError;

      // Reload drafts
      await loadSavedDrafts();
      
      toast({
        title: "Version Restored",
        description: `Version ${version.version} has been restored successfully.`,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to restore version";
      setError(errorMsg);
      toast({
        title: "Restore Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !user) return;

    const autoSaveInterval = setInterval(() => {
      Object.keys(draftData).forEach(async (moduleKey) => {
        if (draftData[moduleKey] && Object.keys(draftData[moduleKey]).length > 0) {
          await saveModuleDraft(moduleKey, draftData[moduleKey], undefined, true);
        }
      });
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [draftData, autoSaveEnabled, user]);

  return (
    <DraftContext.Provider
      value={{
        draftData,
        updateDraft,
        getDraft,
        clearDraft,
        saveDraft,
        loadDraft,
        deleteDraft,
        savedDrafts,
        isLoading,
        error,
        saveModuleDraft,
        loadModuleDraft,
        getModuleDraftVersions,
        restoreVersion,
        autoSaveEnabled,
        setAutoSaveEnabled,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = () => {
  const context = useContext(DraftContext);
  if (context === undefined) {
    throw new Error("useDraft must be used within a DraftProvider");
  }
  return context;
};
