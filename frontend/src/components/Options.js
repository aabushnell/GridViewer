export default function Options({ view, setView }) {
  return (
    <div className="options">
      <input
        type="radio"
        name="none"
        value="none"
        id="none"
        checked={view === 'none'}
        onChange={() => setView('none')}
      />
      <label htmlFor="none">None</label>
      <input
        type="radio"
        name="elevation"
        value="elevation"
        id="elevation"
        checked={view === 'elevation'}
        onChange={() => setView('elevation')}
      />
      <label htmlFor="elevation">Elevation</label>
      <input
        type="radio"
        name="landlake"
        value="landlake"
        id="landlake"
        checked={view === 'landlake'}
        onChange={() => setView('landlake')}
      />
      <label htmlFor="landlake">Land/Lake</label>
    </div>
  );
}
