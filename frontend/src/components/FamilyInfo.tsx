import { Card, Text, Title } from '@mantine/core';
import { useStore } from '../store/useStore';

export function FamilyInfo({ familyCode, surveyNumber }: { familyCode: string | null, surveyNumber: string | null }) {
  const { data } = useStore();
  const familyData = data.find(
    (d) => d.familyCode === familyCode && d.surveyNumber === surveyNumber
  );

  if (!familyData) {
    return;
  }

  return (
    <Card withBorder radius="md" p="lg" mt="md" style={{ height: '600px' }}>
      <Title order={4} mb="sm">Family Information</Title>
      <Text mb="xs"><strong>People in the household:</strong> {familyData?.houseHold}</Text>
      <Text mb="xs"><strong>Race:</strong> {familyData?.race}</Text>
      <Text mb="xs"><strong>LGBTQ:</strong> {familyData?.lgbtq}</Text>
      <Text mb="xs"><strong>Housing:</strong> {familyData?.housing}</Text>
      <Text mb="xs"><strong>Automobile:</strong> {familyData?.automobile}</Text>
      <Text mb="xs"><strong>Early Childhood Education:</strong> {familyData?.ece}</Text>
      <Text mb="xs"><strong>Education:</strong> {familyData?.education}</Text>
      <Text mb="xs"><strong>Employment:</strong> {familyData?.employment}</Text>
      <Text mb="xs"><strong>Assistance:</strong> {familyData?.assistance}</Text>
      <Text><strong>Income:</strong> { familyData?.income == "" ? "N/A" : familyData?.income }</Text>
    </Card>
  );
};