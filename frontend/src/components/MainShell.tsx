import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { GeoMap } from './GeoMap';
import { useState } from 'react';
import { Group, Grid, ScrollArea, AppShell, 
                Burger, Drawer, Text, CloseButton, Input, 
                Stack, NativeSelect, Divider, NumberInput,
                Button} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

// export function MainShell(
//   { 
//     onGroupFeatureClick, 
//     neighbours,
//     minDist,
//     metric,
//     setNeighbours,
//     setMinDist,
//    }: { 
//     onGroupFeatureClick?: (groupName: string[]) => void;
//     neighbours: number;
//     minDist: number;
//     metric: string;
//     setNeighbours?: (neighbours: number) => void;
//     setMinDist?:(minDist: number) => void;
//   }
export function MainShell(
  { 
    onGroupFeatureClick, 
    neighbours,
    minDist,
    metric,
   }: { 
    onGroupFeatureClick?: (groupName: string[]) => void;
    neighbours: number;
    minDist: number;
    metric: string;
  }
) {
  const [scatterHovered, setScatterHovered] = useState<{ familyCode: string, surveyNumber: string } | null>(null);
  const [heatmapHovered, setHeatmapHovered] = useState<{ familyCode: string, surveyNumber: string } | null>(null);
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
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>North Carolina - Poverty Stoplight</h1>
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
            <HoverInfo familyCode={(heatmapHovered ?? scatterHovered)?.familyCode ?? null}
                    surveyNumber={(heatmapHovered ?? scatterHovered)?.surveyNumber ?? null} />
        </ScrollArea>
        <Drawer opened={opened} onClose={close}
          transitionProps={{ transition: 'rotate-left', duration: 150, timingFunction: 'linear' }}
          zIndex={1000}
        >
          {/* Add UI Controls Here Color by > Cluster */}
          <Text size="md" td="underline">Data controls</Text>
          <NativeSelect label="Dataset" data={['North Carolina', 'Rwanda']} />
          <NativeSelect label="Survey" data={['All', '1', '2', '3']} />
          <Divider my="md" />
          <Text size="md" td="underline">UMAP controls</Text>
           <NumberInput
            label="Number of Neighbours (n_neighbours)"
            min={2}
            defaultValue={neighbours}
            max={100}
          />
          <NumberInput
            label="Minimum Distance (min_dist)"
            min={0.1}
            decimalScale={1}
            defaultValue={minDist}
            fixedDecimalScale
            max={100.0}
          />
          <NativeSelect label="Metric" data={['Euclidean', 'Manhattan', 'Jaccard', 'Hamming', 'Correlation']} 
          defaultValue={metric}/>
          <Button variant="danger" mt='md'>Re-calculate</Button>
        </Drawer>
      </AppShell.Navbar>

      <AppShell.Main>
        <Grid gutter={0}> 
          <Grid.Col span={4}>
            <Stack gap="md"> 
              <Legend />
              <ScatterPlot 
                onHover={(key) => {
                  setScatterHovered(key);
                  setHeatmapHovered(null);  
                }} 
                searchValue={searchValue}
                heatmapHovered={heatmapHovered}
              />
              <GeoMap />
            </Stack>
          </Grid.Col>

          <Grid.Col span={8}>
            <ScrollArea h="calc(100vh - 80px)">
              <Heatmap 
                onGroupFeatureClick={onGroupFeatureClick} 
                family={scatterHovered} 
                onHover={(key) => {
                  setHeatmapHovered(key);
                  setScatterHovered(null);  
                }} 
                searchValue={searchValue}
              />
            </ScrollArea>
          </Grid.Col>
        </Grid>
      </AppShell.Main>
    </AppShell>
);
}
