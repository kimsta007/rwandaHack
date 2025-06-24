import { Card, Text, Group, Badge, ScrollArea } from '@mantine/core';
import { Fragment } from 'react';
import { useStore } from '../store/useStore';

export function HoverInfo({ familyCode, surveyNumber }: { familyCode: string | null, surveyNumber: string | null }) {
  const { data } = useStore();

  const colorMap: Record<number, string> = {
    1: '#ffc20a',
    2: '#0c7bdc',
  };

  let tooltip = 'No data available';

  if (familyCode && surveyNumber) {
    const row = data.find(
      (row) => row.familyCode === familyCode && row.surveyNumber === surveyNumber
    );

    if (row && row.tooltip) {
      tooltip = row.tooltip;
    }
  }

  return (
    <Card padding="md" radius="md" withBorder style={{ height: '500px' }}>
      <Group justify="space-between" mt="md" mb="xs">
        <Text size="md" fw={500}>
          {familyCode ?? ''} - {surveyNumber ?? ''}
        </Text>
      </Group>

      {tooltip && (
        <ScrollArea h={400}>
          <Text>Priorities</Text>
          {tooltip.split('>>').map((text, i) => {
            const tooltipText = text.split('|');
            const colorKey = Number(tooltipText[0]?.trim());
            const badgeColor = colorMap[colorKey] || '#bdbdbd';
            return (
              <Fragment key={i}>
                <Badge size="md" style={{ backgroundColor: badgeColor, color: '#fff', marginRight: 4 }}>
                  {tooltipText[1]?.split(':')[0]?.trim() || 'No data'}
                </Badge>
                <Text ta="left" size="xs" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
                  {
                    tooltipText[1]?.split(':')[1]?.split('$$')[0]?.trim().includes('nan') ? 'No feedback' : tooltipText[1]?.split(':')[1]?.split('$$')[0]?.trim() 
                  }
                </Text>
              </Fragment>
            );
          })}
        </ScrollArea>
      )}
    </Card>
  );
}