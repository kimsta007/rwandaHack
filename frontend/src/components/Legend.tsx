import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export function Legend() {
  const { legendItems, selectedIndicator, setSelectedIndicator, featureMatrix, keys, 
                        setSelectedIndices, setSelectedKeys, featureNames } = useStore();
                        
  const index = featureNames.indexOf('income');
  
  const handleClick = (indicator: number) => {
    setSelectedIndicator(selectedIndicator === indicator ? -1 : indicator);
  };

  useEffect(() => {
    if (selectedIndicator !== -1) {
      const newSelectedIndices: number[] = [];
      const newSelectedKeys: string[] = [];

      featureMatrix.forEach((row, i) => {
        const val = row[index];
        if (val === selectedIndicator) {
          newSelectedIndices.push(i);
          if (keys[i]) newSelectedKeys.push(keys[i]);
        }
      });
      setSelectedIndices(newSelectedIndices);
      setSelectedKeys(newSelectedKeys);
    } else {
      setSelectedIndices([]);
      setSelectedKeys([]);
    }
  }, [selectedIndicator]);

  return (
    <div>
      <strong>Indicator</strong>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
        {legendItems.map((item) => (
          <div
            key={item.label}
            onClick={() => handleClick(item.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontWeight: selectedIndicator === item.value ? 'bold' : 'normal',
              color: selectedIndicator === item.value ? 'black' : '#666',
              opacity: selectedIndicator === -1 || selectedIndicator === item.value ? 1 : 0.5,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: item.color,
                borderRadius: '50%',
                marginRight: 6,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
