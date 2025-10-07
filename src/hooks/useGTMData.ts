import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface GTMData {
  id?: string;
  projectName: string;
  productRoadmap?: any;
  customerPainPoints?: any;
  competitorAnalysis?: any;
  swotAnalysis?: any;
  productConcept?: any;
  keyAudiencePitches?: any;
  launchGoalsKPIs?: any;
  statusLog?: any;
  customerJourneyMap?: any;
  promotionsChecklist?: any;
  outreachChannels?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const useGTMData = (projectId?: string) => {
  const [gtmData, setGTMData] = useState<GTMData>({
    projectName: 'New GTM Plan'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { appUser } = useAuth();

  useEffect(() => {
    if (projectId) {
      loadGTMData(projectId);
    } else if (!appUser) {
      // Load from localStorage for unauthenticated users
      const savedData = localStorage.getItem('gtm_data');
      if (savedData) {
        try {
          setGTMData(JSON.parse(savedData));
        } catch (error) {
          console.error('Error parsing saved GTM data:', error);
        }
      }
    }
  }, [projectId, appUser]);

  const loadGTMData = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .select('*')
        .eq('id', id)
        .eq('type', 'gtm')
        .single();

      if (error) throw error;

      if (data) {
        setGTMData({
          id: data.id,
          projectName: data.title || 'GTM Plan',
          ...data.content
        });
      }
    } catch (error) {
      console.error('Error loading GTM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGTMData = async (data: Partial<GTMData>) => {
    if (!appUser) {
      // Fallback to localStorage for unauthenticated users
      const updatedData = { ...gtmData, ...data };
      localStorage.setItem('gtm_data', JSON.stringify(updatedData));
      setGTMData(updatedData);
      return updatedData;
    }

    setSaving(true);
    try {
      const updatedData = { ...gtmData, ...data };
      
      if (gtmData.id) {
        // Update existing
        const { error } = await supabase
          .from('business_plans')
          .update({
            title: updatedData.projectName,
            content: updatedData,
            updated_at: new Date().toISOString()
          })
          .eq('id', gtmData.id);

        if (error) throw error;
      } else {
        // Create new
        const { data: newPlan, error } = await supabase
          .from('business_plans')
          .insert({
            title: updatedData.projectName,
            type: 'gtm',
            content: updatedData,
            user_id: appUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        
        if (newPlan) {
          updatedData.id = newPlan.id;
        }
      }

      setGTMData(updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error saving GTM data:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const updateGTMData = (updates: Partial<GTMData>) => {
    setGTMData(prev => ({ ...prev, ...updates }));
  };

  return {
    gtmData,
    loading,
    saving,
    updateGTMData,
    saveGTMData
  };
};