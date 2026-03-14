import React from 'react';
import StageFlowPlayer from './stage/StageFlowPlayer';

export default function FlowPatternSimulator({
  dancersCount = 5,
  flowDataFromDraft = null,
  timeline = [],
  durationLabel = '03:00',
  currentPlan = 'free',
  policy = null,
  dancerRoles = [],
  selectedTime = null,
  onTimeChange = null,
  onSelectDancerRole = null,
}) {
  return (
    <StageFlowPlayer
      teamSize={dancersCount}
      flowDataFromDraft={flowDataFromDraft}
      timeline={timeline}
      durationLabel={durationLabel}
      currentPlan={currentPlan}
      policy={policy}
      dancerRoles={dancerRoles}
      selectedTime={selectedTime}
      onTimeChange={onTimeChange}
      onSelectDancerRole={onSelectDancerRole}
    />
  );
}
