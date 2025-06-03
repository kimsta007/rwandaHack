
import { Box } from '@mantine/core';
import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';

export function AppShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  return (
      <Box style={{ display: 'flex', flexDirection: 'column',  height: '100%', width: '100%', gap: 'md' }}>
        <Box style={{ display: 'flex', width: '100%', gap: 'md'}}>
          <Box style={{ flex: 1, overflow: 'hidden' }}>
            <ScatterPlot />
          </Box>
          <Box style={{ width: 150, flexShrink: 0 }}>
            <Legend />
          </Box>
        </Box>

        <Box style={{ width: '100%', flex: 1 }}>
          <Heatmap onFeatureClick={onFeatureClick} />
        </Box>
      </Box>
  );
}
