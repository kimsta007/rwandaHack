
import { Grid, Paper } from '@mantine/core';
import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';

export function AppShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  return (
    <Grid grow gutter="md" style={{ height: '100vh', padding: 16 }}>
      <Grid.Col span={6}>
        <Paper radius="md" p="md" style={{ height: '100%' }}>
            <ScatterPlot />
        </Paper>
      </Grid.Col>

       <Grid.Col span={6}>
        <Paper radius="md" p="md" style={{ height: '100%' }}>
            <Heatmap onFeatureClick={onFeatureClick}/>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
