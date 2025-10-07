import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

interface RealTimeChartProps {
  title: string;
  color?: string;
  dataKey: string;
  updateInterval?: number;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({
  title,
  color = '#3b82f6',
  dataKey,
  updateInterval = 5000
}) => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 10 }, (_, i) => ({
      time: new Date(Date.now() - (9 - i) * 60000).toLocaleTimeString(),
      value: Math.floor(Math.random() * 100) + 50
    }));
    setData(initialData);

    // Set up real-time updates
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          value: Math.floor(Math.random() * 100) + 50
        };
        return [...prev.slice(1), newPoint];
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RealTimeChart;