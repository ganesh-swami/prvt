import React from 'react';
import { TrendingUp, DollarSign, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';

const metrics = [
  { label: 'Monthly Revenue', value: '$124K', change: '+12%', trend: 'up', icon: DollarSign },
  { label: 'Active Customers', value: '1,247', change: '+8%', trend: 'up', icon: Users },
  { label: 'LTV/CAC Ratio', value: '3.2x', change: '-0.1', trend: 'down', icon: Target },
  { label: 'Growth Rate', value: '23%', change: '+5%', trend: 'up', icon: TrendingUp }
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">North Star Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-blue-600" />
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="ml-1">{metric.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="font-medium text-blue-900">Update Market Sizing</div>
              <div className="text-sm text-blue-700">Refresh TAM/SAM/SOM calculations</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
              <div className="font-medium text-green-900">Review Unit Economics</div>
              <div className="text-sm text-green-700">Check LTV/CAC and payback period</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
              <div className="font-medium text-purple-900">Export Data Room</div>
              <div className="text-sm text-purple-700">Generate investor presentation</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Market sizing updated</div>
                <div className="text-xs text-gray-600">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium">Financial model validated</div>
                <div className="text-xs text-gray-600">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};