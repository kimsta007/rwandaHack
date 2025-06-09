import { Card, Text, Group, Badge } from '@mantine/core';
import { Fragment } from 'react';
import { useStore } from '../store/useStore';

export function HoverInfo({ familyCode }: { familyCode: string | null }) {
  const { tooltipData} = useStore();
  const colorMap: { [key: number]: string } = 
  {
    1: '#ffc20a',
    2: '#0c7bdc',
  };

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
          <Text>Priorities</Text>
          {tooltip.split('>>').map((text, i) => {
            const tooltipText = text.split('|');
            const colorKey = Number(tooltipText[0]?.trim());
            const badgeColor = colorMap[colorKey] || '#bdbdbd';
            return (
              <Fragment key={i}>
                <Badge size="md" style={{ backgroundColor: badgeColor, color: '#fff', marginRight: 4 }}>
                  {tooltipText[1]?.split(':')[0]?.trim() || 'No data available'}
                </Badge>
                <Text ta="left" size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
                  {tooltipText[1]?.split(':')[1].trim().split('$$')[0].trim()}
                </Text>
              </Fragment>
            );
          })}
        </>
      )}
    </Card>
  );
}
