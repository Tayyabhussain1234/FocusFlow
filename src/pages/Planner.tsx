import React from 'react';
import { WeeklyPlanner } from '../components/WeeklyPlanner';

export const PlannerPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <WeeklyPlanner />
    </div>
  );
};
