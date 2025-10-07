import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export const StatusLog: React.FC = () => {
  const [entries, setEntries] = useState([
    { id: 1, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' },
    { id: 2, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' },
    { id: 3, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' },
    { id: 4, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' },
    { id: 5, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' }
  ]);

  const addEntry = () => {
    const newId = Math.max(...entries.map(e => e.id)) + 1;
    setEntries([...entries, { 
      id: newId, teamLead: '', team: '', department: '', tasks: '', deadline: '', status: false, notes: '' 
    }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: number, field: string, value: any) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">Status log</CardTitle>
        <p className="text-gray-600">
          Create a live status log in a spreadsheet like Google Sheets, Excel, or Numbers to keep track of the following information:
          <br />
          <span className="text-sm">Lead point of contact • Team • Department • Asset details/task list • Readiness check • Ideas and roadblocks • Deadlines</span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Team lead</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Team</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Department</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Tasks</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Deadline</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Status</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold text-sm">Notes</th>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold w-12"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.teamLead}
                      onChange={(e) => updateEntry(entry.id, 'teamLead', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.team}
                      onChange={(e) => updateEntry(entry.id, 'team', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.department}
                      onChange={(e) => updateEntry(entry.id, 'department', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.tasks}
                      onChange={(e) => updateEntry(entry.id, 'tasks', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.deadline}
                      onChange={(e) => updateEntry(entry.id, 'deadline', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Checkbox
                      checked={entry.status}
                      onCheckedChange={(checked) => updateEntry(entry.id, 'status', checked)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      placeholder="[Type here]"
                      value={entry.notes}
                      onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                      className="text-sm border-0 p-1"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4">
          <Button onClick={addEntry} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};