export function Legend() {
  const legendItems = [
    { label: 'Not recorded', color: '#bdbdbd' },
    { label: 'Low', color: '#984ea3' },
    { label: 'Medium', color: '#dbdb1d' },
    { label: 'High', color: '#4daf4a' },
  ];

  return (
    <div style={{ padding: '8px', fontSize: 14, color: '#000' }}>
      <strong>Level</strong>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 4 }}>
        {legendItems.map((item) => (
          <li key={item.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: item.color,
                marginRight: 8,
              }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
