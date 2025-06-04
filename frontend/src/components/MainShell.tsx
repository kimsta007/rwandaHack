import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { useState } from 'react';
import { AppShell } from '@mantine/core';
import { Group, Grid, Box } from '@mantine/core';

export function MainShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
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
      
      <AppShell.Navbar p="md" withBorder style={{ overflow: "scroll" }}>
          <HoverInfo familyCode={hoveredKey}/>
      </AppShell.Navbar>
 
      <AppShell.Main>
        <Grid gutter="md">
          <Grid.Col span="content"> 
            <ScatterPlot onHover={setHoveredKey} />
          </Grid.Col>

          <Grid.Col span="auto"> 
            <Legend />
          </Grid.Col>
        </Grid>

        <Box mt="md">
          <Heatmap onFeatureClick={onFeatureClick} onHover={setHoveredKey} />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
