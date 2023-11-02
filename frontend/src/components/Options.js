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
      <input
        type="radio"
        name="forest"
        value="forest"
        id="forest"
        checked={view === 'forest'}
        onChange={() => setView('forest')}
      />
      <label htmlFor="forest">Forest</label>
      <input
        type="radio"
        name="landarea"
        value="landarea"
        id="landarea"
        checked={view === 'landarea'}
        onChange={() => setView('landarea')}
      />
      <label htmlFor="landarea">Max. Land Area</label>
      <input
        type="radio"
        name="pop3000"
        value="pop3000"
        id="pop3000"
        checked={view === 'pop3000'}
        onChange={() => setView('pop3000')}
      />
      <label htmlFor="pop3000">Pop 3000BC</label>
      <input
        type="radio"
        name="pop0"
        value="pop0"
        id="pop0"
        checked={view === 'pop0'}
        onChange={() => setView('pop0')}
      />
      <label htmlFor="pop3000">Pop 0AD</label>
      <input
        type="radio"
        name="crop0"
        value="crop0"
        id="crop0"
        checked={view === 'crop0'}
        onChange={() => setView('crop0')}
      />
      <label htmlFor="crop0">Cropland 0AD</label>
    </div>
  );
}
