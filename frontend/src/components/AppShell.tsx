import { Box } from '@mantine/core';
import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { useState } from 'react';

export function AppShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  return (
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', gap: 'md' }}>
        <Box style={{ display: 'flex', width: '100%', gap: 'sm'}}>
          <Box style={{ width: 150, flexShrink: 0 }}>
            <Legend />
          </Box>
        <Box style={{ flex: 1, overflow: 'visible', display: 'flex', gap: 'md' }}>
          <Box style={{ flex: 1 }}>
            <ScatterPlot onHover={setHoveredKey} />
          </Box>
          <Box style={{ width: 400, flexShrink: 0, marginLeft: 16, overflow: 'visible' }}>
            <HoverInfo familyCode={hoveredKey}/>
          </Box>
        </Box>
      </Box>
      <Box style={{ width: '100%', flex: 1 }}>
        <Heatmap onFeatureClick={onFeatureClick} />
      </Box>
      </Box>
  );
}
