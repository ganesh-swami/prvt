import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface StakeholderFormData {
  name: string;
  type: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  relationship: 'Supportive' | 'Neutral' | 'Opposing';
  relationshipStrength: number;
  engagementLevel: 'Active' | 'Moderate' | 'Minimal' | 'None';
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  contactInfo: string;
  lastContact: string;
  nextAction: string;
}

interface StakeholderFormProps {
  onAddStakeholder: (stakeholder: StakeholderFormData) => void;
}

const StakeholderForm: React.FC<StakeholderFormProps> = ({ onAddStakeholder }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    type: '',
    influence: 'Medium',
    interest: 'Medium',
    relationship: 'Neutral',
    relationshipStrength: 5,
    engagementLevel: 'Moderate',
    riskLevel: 'Medium',
    description: '',
    contactInfo: '',
    lastContact: '',
    nextAction: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddStakeholder({
      ...formData,
      lastContact: formData.lastContact || new Date().toISOString().split('T')[0]
    });
    setOpen(false);
    setFormData({
      name: '',
      type: '',
      influence: 'Medium',
      interest: 'Medium',
      relationship: 'Neutral',
      relationshipStrength: 5,
      engagementLevel: 'Moderate',
      riskLevel: 'Medium',
      description: '',
      contactInfo: '',
      lastContact: '',
      nextAction: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Add New Stakeholder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stakeholder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Stakeholder Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Key Actor">Key Actor</SelectItem>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Funder">Funder</SelectItem>
                  <SelectItem value="Competitor">Competitor</SelectItem>
                  <SelectItem value="Sector">Sector</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Influence Level</Label>
              <Select value={formData.influence} onValueChange={(value: any) => setFormData({...formData, influence: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Interest Level</Label>
              <Select value={formData.interest} onValueChange={(value: any) => setFormData({...formData, interest: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Relationship</Label>
              <Select value={formData.relationship} onValueChange={(value: any) => setFormData({...formData, relationship: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Supportive">Supportive</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Opposing">Opposing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Relationship Strength (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.relationshipStrength}
                onChange={(e) => setFormData({...formData, relationshipStrength: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Engagement Level</Label>
              <Select value={formData.engagementLevel} onValueChange={(value: any) => setFormData({...formData, engagementLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Minimal">Minimal</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Risk Level</Label>
              <Select value={formData.riskLevel} onValueChange={(value: any) => setFormData({...formData, riskLevel: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of the stakeholder and their role"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                placeholder="Email, phone, or other contact details"
              />
            </div>
            <div>
              <Label htmlFor="lastContact">Last Contact Date</Label>
              <Input
                id="lastContact"
                type="date"
                value={formData.lastContact}
                onChange={(e) => setFormData({...formData, lastContact: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nextAction">Next Action</Label>
            <Input
              id="nextAction"
              value={formData.nextAction}
              onChange={(e) => setFormData({...formData, nextAction: e.target.value})}
              placeholder="Planned next engagement or action"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Stakeholder</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderForm;