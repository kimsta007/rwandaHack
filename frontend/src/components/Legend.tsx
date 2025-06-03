import { useStore } from '../store/useStore';

export function Legend() {
  const { selectedLevel, setSelectedLevel } = useStore();

  const legendItems = [
    { label: 'Not recorded', color: '#bdbdbd' },
    { label: 'Low', color: '#984ea3' },
    { label: 'Medium', color: '#dbdb1d' },
    { label: 'High', color: '#4daf4a' },
  ];

  const handleClick = (level: string | null) => {
    setSelectedLevel(selectedLevel === level ? null : level);
  };


  return (
      <div>
      <strong>Level</strong>
      {legendItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontWeight: selectedLevel === item.label ? 'bold' : 'normal',
            color: selectedLevel === item.label ? 'black' : '#666',
            opacity: selectedLevel === null || selectedLevel === item.label ? 1 : 0.5,
            marginBottom: 4,
          }}
          onClick={() => handleClick(item.label)}
        >
          <div
            style={{
              width: 12,
              height: 12,
              backgroundColor: item.color,
              borderRadius: '50%',
              marginRight: 8,
            }}
          />
          {item.label}
        </div>
      ))}
    </div>
  );
}
