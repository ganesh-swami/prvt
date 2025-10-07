import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Plus } from 'lucide-react';
import { CustomTooltip } from '@/components/common/CustomTooltip';

interface Risk {
  id: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  owner: string;
  mitigationStrategy: string;
  status: 'Active' | 'Resolved' | 'Mitigated' | 'Monitoring';
}

interface RiskRegisterFormProps {
  onAddRisk: (risk: Omit<Risk, 'id'>) => void;
}

const RiskRegisterForm: React.FC<RiskRegisterFormProps> = ({ onAddRisk }) => {
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    likelihood: [5],
    impact: [5],
    owner: '',
    mitigationStrategy: '',
    status: 'Active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.description && formData.category) {
      onAddRisk({
        description: formData.description,
        category: formData.category,
        likelihood: formData.likelihood[0],
        impact: formData.impact[0],
        owner: formData.owner,
        mitigationStrategy: formData.mitigationStrategy,
        status: formData.status
      });
      setFormData({
        description: '',
        category: '',
        likelihood: [5],
        impact: [5],
        owner: '',
        mitigationStrategy: '',
        status: 'Active'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Add New Risk</CardTitle>
          <CustomTooltip content="Register new risks with comprehensive details including likelihood, impact assessment, ownership assignment, and initial mitigation strategies." />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description">Risk Description</Label>
                <CustomTooltip content="Clear, concise description of the potential risk event or condition. Should be specific enough to enable proper assessment and response planning." />
              </div>
              <Textarea
                id="description"
                placeholder="Describe the potential risk..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="category">Category</Label>
                <CustomTooltip content="Risk classification helps with organization, reporting, and assignment to appropriate specialists. Common categories include Strategic, Operational, Financial, Compliance, and Technical." />
              </div>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strategic">Strategic</SelectItem>
                  <SelectItem value="Operational">Operational</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Regulatory">Regulatory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Likelihood: {formData.likelihood[0]}/10</Label>
                <CustomTooltip content="Probability of the risk event occurring within the assessment timeframe. Scale: 1-3 (Low), 4-6 (Medium), 7-10 (High). Consider historical data, expert judgment, and current conditions." />
              </div>
              <Slider
                value={formData.likelihood}
                onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Impact: {formData.impact[0]}/10</Label>
                <CustomTooltip content="Severity of consequences if the risk materializes. Consider financial, operational, reputational, and strategic impacts. Scale: 1-3 (Minor), 4-6 (Moderate), 7-10 (Severe)." />
              </div>
              <Slider
                value={formData.impact}
                onValueChange={(value) => setFormData({ ...formData, impact: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="owner">Risk Owner</Label>
                <CustomTooltip content="Individual responsible for monitoring, managing, and reporting on this specific risk. Should have authority and resources to implement mitigation strategies." />
              </div>
              <Input
                id="owner"
                placeholder="Risk owner name/role"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="status">Status</Label>
                <CustomTooltip content="Current state of risk management. Active: requires attention, Monitoring: under observation, Mitigated: controls implemented, Resolved: risk eliminated." />
              </div>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="Mitigated">Mitigated</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="mitigation">Mitigation Strategy</Label>
              <CustomTooltip content="Specific actions, controls, or measures to reduce risk likelihood or impact. Should be actionable, measurable, and assigned to responsible parties with timelines." />
            </div>
            <Textarea
              id="mitigation"
              placeholder="Describe mitigation approach..."
              value={formData.mitigationStrategy}
              onChange={(e) => setFormData({ ...formData, mitigationStrategy: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Risk to Register
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RiskRegisterForm;