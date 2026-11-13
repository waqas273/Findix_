import React from 'react';
import { ShieldCheck, TrendingUp, Clock, Globe, Lock } from 'lucide-react';
import { Card } from '../ui/Card';

export const MetricsTicker = () => {
  const metrics = [
    {
      label: 'Recovery Success Rate',
      value: '96.4%',
      subtitle: 'Across returned items nationwide',
      icon: TrendingUp,
      color: 'text-emerald-600',
    },
    {
      label: 'Protected Items in PK',
      value: '5,000+',
      subtitle: 'Active laser tags in circulation',
      icon: Globe,
      color: 'text-cyan-600',
    },
    {
      label: 'Avg Response Window',
      value: '< 2 Hours',
      subtitle: 'From finder scan to notification',
      icon: Clock,
      color: 'text-teal-600',
    },
    {
      label: 'Zero-Leak Privacy',
      value: '256-bit',
      subtitle: 'Encrypted relay without number leak',
      icon: Lock,
      color: 'text-indigo-600',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card
              key={idx}
              hoverEffect
              className="p-5 sm:p-6 bg-white border-slate-200 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-slate-500">{metric.label}</span>
                <Icon className={`w-4 h-4 ${metric.color}`} />
              </div>

              <div className="text-2xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
                {metric.value}
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                {metric.subtitle}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default MetricsTicker;
