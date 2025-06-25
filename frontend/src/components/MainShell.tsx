import { ScatterPlot } from './ScatterPlot';
import { Heatmap } from './Heatmap';
import { Legend } from './Legend';
import { HoverInfo } from './HoverInfo';
import { GeoMap } from './GeoMap';
import { FamilyInfo } from './FamilyInfo';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Group, Grid, ScrollArea, AppShell, 
                Burger, Drawer, Text, CloseButton, Input, 
                Stack, NativeSelect, Divider, NumberInput,
                Button} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export function MainShell(
  { 
    onGroupFeatureClick, 
    neighbours,
    minDist,
    metric,
    selectedSurvey,
    setSelectedSurvey,
    setMetric,
    setNeighbours,
    setMinDist,
    setRecalculate,
   }: { 
    onGroupFeatureClick?: (groupName: string[]) => void;
    neighbours: number;
    minDist: number;
    metric: string;
    selectedSurvey: string;
    setSelectedSurvey: (surveyNumber: string) => void;
    setMetric: (metric: string) => void;
    setNeighbours: (neighbours: number) => void;
    setMinDist:(minDist: number) => void;
    setRecalculate: (recalculate: boolean) => void;
  }
) {
  const [scatterHovered, setScatterHovered] = useState<{ familyCode: string, surveyNumber: string } | null>(null);
  const [heatmapHovered, setHeatmapHovered] = useState<{ familyCode: string, surveyNumber: string } | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const { selectedDataset, setSelectedDataset } = useStore();

const handleDatasetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelectedDataset(e.currentTarget.value);
}

const handleSurveyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelectedSurvey(e.currentTarget.value);
}

const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setMetric(e.currentTarget.value);
} 

const handleNeighboursChange = (value: string | number) => {
    setNeighbours(typeof value === 'number' ? value : parseInt(value));
}

const handleMinDistChange = (value: string | number) => {
    setMinDist(typeof value === 'number' ? value : parseFloat(value));
}

const handleRecalculate = () => {
  setRecalculate(true);
}

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
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{ selectedDataset } - Poverty Stoplight</h1>
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
            <HoverInfo familyCode={(heatmapHovered ?? scatterHovered)?.familyCode ?? null}
                    surveyNumber={(heatmapHovered ?? scatterHovered)?.surveyNumber ?? null} />
            <FamilyInfo familyCode={(heatmapHovered ?? scatterHovered)?.familyCode ?? null}
                    surveyNumber={(heatmapHovered ?? scatterHovered)?.surveyNumber ?? null} />
        <Drawer opened={opened} onClose={close}
          transitionProps={{ transition: 'rotate-left', duration: 150, timingFunction: 'linear' }}
          zIndex={1000}
        >
          <Text size="md" td="underline">Data controls</Text>
          <NativeSelect label="Dataset" data={['North Carolina', 'Paraguay','Rwanda']} onChange={handleDatasetChange} value={selectedDataset}/>
          <NativeSelect label="Survey" data={['All', '1', '2', '3', '4']} onChange={handleSurveyChange} value={selectedSurvey}/>
          <Divider my="md" />
          <Text size="md" td="underline">UMAP controls</Text>
           <NumberInput
            label="Number of Neighbours (n_neighbours)"
            min={2}
            defaultValue={neighbours}
            max={100}
            onChange={handleNeighboursChange}
          />
          <NumberInput
            label="Minimum Distance (min_dist)"
            min={0.1}
            decimalScale={1}
            defaultValue={minDist}
            fixedDecimalScale
            max={100.0}
            onChange={handleMinDistChange}
          />
          <NativeSelect label="Metric" data={['Euclidean', 'Manhattan', 'Jaccard', 'Hamming', 'Correlation']} 
          defaultValue={metric} onChange={handleMetricChange}/>
          <Button variant="danger" mt='md' onClick={handleRecalculate}>Re-calculate</Button>
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
              <GeoMap 
                scatterHovered={scatterHovered}
                heatmapHovered={heatmapHovered}
              />
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
