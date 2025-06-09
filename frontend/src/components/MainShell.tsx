import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { GeoMap } from './GeoMap';
import { useState } from 'react';
import { AppShell } from '@mantine/core';
import { Group, Grid, Box, ScrollArea } from '@mantine/core';

export function MainShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  const [scatterHoveredKey, setScatterHoveredKey] = useState<string | null>(null);
  const [heatmapHoveredKey, setHeatmapHoveredKey] = useState<string | null>(null);

  return (
 <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
      }}
      padding="md"
    >

      <AppShell.Header>
        <Group h="100%" px="0" justify="space-between">
          <Group h="100%" px="md">
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>North Carolina - Poverty Spotlight</h1>
          </Group>
        </Group>
      </AppShell.Header> 
      
      <AppShell.Navbar p="md" withBorder style={{ overflow: 'hidden', height: '100vh' }}>
        <ScrollArea style={{ height: '100%' }}>
          <HoverInfo familyCode={heatmapHoveredKey || scatterHoveredKey} />
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Grid gutter="md">
          <Grid.Col span="auto"> 
            <GeoMap />
          </Grid.Col>

          <Grid.Col span="content"> 
            <ScatterPlot onHover={setScatterHoveredKey} />
          </Grid.Col>

          <Grid.Col span="auto"> 
            <Legend />
          </Grid.Col>
        </Grid>

        <Box mt="md">
          <Heatmap onFeatureClick={onFeatureClick} familyCode={scatterHoveredKey} onHover={setHeatmapHoveredKey} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
