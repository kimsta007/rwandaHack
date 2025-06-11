import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { GeoMap } from './GeoMap';
import { useState } from 'react';
import { Group, Grid, ScrollArea, AppShell, 
                Burger, Drawer, Text, CloseButton, Input, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function MainShell(
  { onFeatureClick }: { onFeatureClick?: (featureName: string) => void } = {}
) {
  const [scatterHoveredKey, setScatterHoveredKey] = useState<string | null>(null);
  const [heatmapHoveredKey, setHeatmapHoveredKey] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');

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
            <Burger opened={opened} onClick={open} visibleFrom="sm" size="sm" />
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>North Carolina - Poverty Spotlight</h1>
          </Group>

          <Group h="100%" align="center" gap="md">
            <Text size="lg" mt="md">Search</Text>
            <Input
              placeholder="e.g water, credit"
              value={searchValue}
              onChange={(event) => setSearchValue(event.currentTarget.value)}
              rightSectionPointerEvents="all"
              size="md"
              mt="xs" 
              mr="lg"
              w={300} 
              rightSection={
                <CloseButton
                  onClick={() => setSearchValue('')}
                  style={{ display: searchValue ? undefined : 'none' }}
                />
              }
            />
          </Group>
        </Group>
      </AppShell.Header> 
      
      <AppShell.Navbar p="md" withBorder style={{ overflow: 'hidden', height: '100vh' }}>
        <ScrollArea style={{ height: '100%' }}>
          <HoverInfo familyCode={heatmapHoveredKey || scatterHoveredKey} />
        </ScrollArea>
        <Drawer opened={opened} onClose={close}
          transitionProps={{ transition: 'rotate-left', duration: 150, timingFunction: 'linear' }}
          zIndex={1000}
        >
          {/* Add UI Controls Here Color by > Cluster */}
        </Drawer>
      </AppShell.Navbar>

      <AppShell.Main>
        <Grid gutter={0}> 
          <Grid.Col span={4}>
            <Stack gap="md"> 
              <Legend />
              <ScatterPlot onHover={setScatterHoveredKey} />
              <GeoMap />
            </Stack>
          </Grid.Col>

          <Grid.Col span={8}>
            <Heatmap onFeatureClick={onFeatureClick} familyCode={scatterHoveredKey} onHover={setHeatmapHoveredKey} />
          </Grid.Col>
        </Grid>
      </AppShell.Main>
    </AppShell>
  );
}
