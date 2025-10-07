import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomTooltip } from '@/components/common/CustomTooltip';
import { Clock, Plus, TrendingUp, MessageSquare } from 'lucide-react';

interface TimelineEntry {
  id: string;
  stakeholderId: string;
  date: string;
  type: 'Meeting' | 'Email' | 'Call' | 'Event' | 'Milestone';
  description: string;
  outcome: 'Positive' | 'Neutral' | 'Negative';
  relationshipChange: number; // -5 to +5
}

interface EnhancedStakeholder {
  id: string;
  name: string;
  type: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  relationship: 'Supportive' | 'Neutral' | 'Opposing';
  relationshipStrength: number;
  engagementLevel: 'Active' | 'Moderate' | 'Minimal' | 'None';
  lastContact: string;
  nextAction: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  contactInfo?: string;
}

interface RelationshipTimelineProps {
  stakeholders: EnhancedStakeholder[];
}

const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({ stakeholders }) => {
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([
    {
      id: '1',
      stakeholderId: '1',
      date: '2024-01-15',
      type: 'Meeting',
      description: 'Initial project presentation and policy discussion',
      outcome: 'Positive',
      relationshipChange: 2
    },
    {
      id: '2',
      stakeholderId: '2',
      date: '2024-01-20',
      type: 'Event',
      description: 'Community feedback session - gathered user insights',
      outcome: 'Positive',
      relationshipChange: 1
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    stakeholderId: '',
    date: '',
    type: 'Meeting' as const,
    description: '',
    outcome: 'Neutral' as const,
    relationshipChange: 0
  });

  const addTimelineEntry = () => {
    if (newEntry.stakeholderId && newEntry.date && newEntry.description) {
      const entry: TimelineEntry = {
        ...newEntry,
        id: Date.now().toString()
      };
      setTimelineEntries([...timelineEntries, entry]);
      setNewEntry({
        stakeholderId: '',
        date: '',
        type: 'Meeting',
        description: '',
        outcome: 'Neutral',
        relationshipChange: 0
      });
      setShowAddForm(false);
    }
  };

  const getStakeholderName = (id: string) => {
    return stakeholders.find(s => s.id === id)?.name || 'Unknown';
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedEntries = [...timelineEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Relationship Timeline</h3>
          <CustomTooltip content="Track all stakeholder interactions over time to identify relationship trends and patterns" />
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Timeline Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Stakeholder</label>
                <Select value={newEntry.stakeholderId} onValueChange={(value) => 
                  setNewEntry({...newEntry, stakeholderId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stakeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakeholders.map(stakeholder => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input 
                  type="date" 
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Interaction Type</label>
                <Select value={newEntry.type} onValueChange={(value: any) => 
                  setNewEntry({...newEntry, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Milestone">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Outcome</label>
                <Select value={newEntry.outcome} onValueChange={(value: any) => 
                  setNewEntry({...newEntry, outcome: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Neutral">Neutral</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={newEntry.description}
                onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                placeholder="Describe the interaction and key outcomes..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addTimelineEntry}>Add Entry</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getStakeholderName(entry.stakeholderId)}</span>
                    <Badge variant="outline">{entry.type}</Badge>
                    <Badge className={getOutcomeColor(entry.outcome)}>{entry.outcome}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{entry.date}</span>
                    {entry.relationshipChange !== 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>Relationship {entry.relationshipChange > 0 ? '+' : ''}{entry.relationshipChange}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelationshipTimeline;