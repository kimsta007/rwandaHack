import { Card, Text, Group } from '@mantine/core';
import { useStore } from '../store/useStore';

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
    <Card padding="md" radius="md" withBorder >
      <Group justify="space-between" mt="md" mb="xs">
        <Text size="md" fw={500}>
            {familyCode ? `${familyCode}` : ''}
        </Text>
      </Group>
      {tooltip && (
        <>
          {tooltip.split('>>').map((response, i) => (
            <Text key={i} ta="left" size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {response.trim()}
            </Text>
          ))}
        </>
      )}
    </Card>
  );
}
