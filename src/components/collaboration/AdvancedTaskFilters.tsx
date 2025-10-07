import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, Calendar, User, Flag } from 'lucide-react';

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  assignee: string[];
  dueDate: string;
  tags: string[];
}

interface AdvancedTaskFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  taskCount: number;
}

export const AdvancedTaskFilters: React.FC<AdvancedTaskFiltersProps> = ({ 
  onFiltersChange, 
  taskCount 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    assignee: [],
    dueDate: '',
    tags: []
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = ['To Do', 'In Progress', 'Review', 'Done'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const assigneeOptions = ['Alice', 'Bob', 'Carol', 'David', 'Eve'];
  const tagOptions = ['Research', 'Design', 'Development', 'Marketing', 'Finance'];

  const updateFilters = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'assignee' | 'tags', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      status: [],
      priority: [],
      assignee: [],
      dueDate: '',
      tags: []
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = Object.values(filters).flat().filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-4 h-4" />
            Task Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{taskCount} tasks</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => updateFilters('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {isExpanded && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => toggleArrayFilter('status', status)}
                      />
                      <label className="text-sm">{status}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <div className="space-y-2">
                  {priorityOptions.map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.priority.includes(priority)}
                        onCheckedChange={() => toggleArrayFilter('priority', priority)}
                      />
                      <label className="text-sm flex items-center gap-1">
                        <Flag className={`w-3 h-3 ${priority === 'High' ? 'text-red-500' : priority === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`} />
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assignee</label>
              <div className="flex flex-wrap gap-2">
                {assigneeOptions.map((assignee) => (
                  <Badge
                    key={assignee}
                    variant={filters.assignee.includes(assignee) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('assignee', assignee)}
                  >
                    <User className="w-3 h-3 mr-1" />
                    {assignee}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Due Date</label>
              <Select value={filters.dueDate} onValueChange={(value) => updateFilters('dueDate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="today">Due Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};