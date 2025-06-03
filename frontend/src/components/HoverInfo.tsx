import { Card, Text } from '@mantine/core';
import { useStore } from '../store/useStore';
import { Group } from '@mantine/core';

export function HoverInfo({ familyCode }: { familyCode: string | null }) {
  const { tooltipData } = useStore();

  let tooltip = 'No data available';
  if (familyCode && tooltipData?.familyCode && tooltipData?.tooltip) {
    const index: any = Object.entries(tooltipData.familyCode).find(
      ([, value]) => value === familyCode
    )?.[0];

    if (index !== undefined && tooltipData.tooltip[index]) {
      tooltip = tooltipData.tooltip[index];
    }
  }
  
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ overflow: 'visible', width: '100%' }} >
      <Group justify="space-between" mt="md" mb="xs">
        <Text size="sm" fw={500}>
            {familyCode ? `${familyCode}` : ''}
        </Text>
      </Group>
      {tooltip && (
        <>
          {tooltip.split('>>').map((response, i) => (
            <Text key={i} ta="left" size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {response.trim()}
            </Text>
          ))}
        </>
      )}
    </Card>
  );
}
