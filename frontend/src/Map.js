import React, { useRef, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import data from './coarse_grid.json';

import Options from './components/Options.js';

import { coordToIndexCoarse } from './helpers.js';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWFidXNobmVsbCIsImEiOiJjbG5hYnFkZGYwMmpuMm5tcWR6ZXhkeTI4In0.1N86NiPVYwfxJ3Q-Ldi_Pw';

const ZOOM_THRESHOLD = 5.2;
const ZOOM_TOLERANCE = 1.0;

export default function Map() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  const [lng, setLng] = useState(10);
  const [lat, setLat] = useState(-40);
  const [zoom, setZoom] = useState(2);

  const [hoveredIDCoarse, setHoveredIDCoarse] = useState(null);
  const [prevHoveredIDCoarse, setPrevHoveredIDCoarse] = useState(null);
  const [hoveredIDFine, setHoveredIDFine] = useState(null);
  const [prevHoveredIDFine, setPrevHoveredIDFine] = useState(null);

  const [context, setContext] = useState('coarse');

  const [elevation, setElevation] = useState(null);
  const [landlake, setLandLake] = useState(null);
  const [forest, setForest] = useState(null);
  const [pop3000, setPop3000] = useState(null);
  const [pop0, setPop0] = useState(null);
  const [crop0, setCrop0] = useState(null);
  const [landarea, setLandArea] = useState(null);
  const [weight, setWeight] = useState(null);
  const [cost, setCost] = useState(null);

  const [coarseIndexY, setCoarseIndexY] = useState(null);
  const [coarseIndexX, setCoarseIndexX] = useState(null);
  const [fineIndexY, setFineIndexY] = useState(null);
  const [fineIndexX, setFineIndexX] = useState(null);

  const [neighbor, setNeighbor] = useState(null);
  const [prevNeighbor, setPrevNeighbor] = useState(-1);

  const [view, setView] = useState('none');
  const [viewMode, setViewMode] = useState('none');

  const [cachedFineGrids, setCachedFineGrids] = useState(null);
  const [centerGrid, setCenterGrid] = useState(null);

  // console.log(data);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'simple-tiles': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'simple-tiles',
            paint: {},
            maxzoom: 22,
          },
        ],
      },
      center: [-40, 10],
      zoom: 2,
      attributionControl: false,
    });

    map.on('load', () => {
      map.addSource('coarse_grid', {
        type: 'geojson',
        data: data,
      });

      map.addSource('fine_grid', {
        type: 'geojson',
        data: {},
      });

      map.addLayer({
        id: 'coarse_grid',
        type: 'fill',
        maxzoom: 22,
        source: 'coarse_grid',
        interactive: true,
        paint: {
          'fill-color': 'rgba(0,0,0,0)',
        },
      });

      map.addLayer({
        id: 'coarse_lines',
        type: 'line',
        maxzoom: 22,
        source: 'coarse_grid',
        interactive: true,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': 'rgba(0,0,0,0.3)',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            3,
            0.8,
          ],
        },
      });

      map.on('move', () => {
        setLng(map.getCenter().lng.toFixed(4));
        setLat(map.getCenter().lat.toFixed(4));
        setZoom(map.getZoom().toFixed(2));
      });

      map.on('mousemove', 'coarse_grid', (e) => {
        if (e.features.length > 0) {
          setHoveredIDCoarse(e.features[0].id);
          setCoarseIndexY(e.features[0].properties.index_y);
          setCoarseIndexX(e.features[0].properties.index_x);
        }
      });

      map.on('mousemove', 'fine_grid', (e) => {
        if (e.features.length > 0) {
          // console.log(e.features[0].id);
          setHoveredIDFine(e.features[0].id);
          setElevation(e.features[0].properties.elevation);
          setLandLake(e.features[0].properties.landlake);
          setForest(e.features[0].properties.forest);
          setPop3000(e.features[0].properties.pop3000);
          setPop0(e.features[0].properties.pop0);
          setCrop0(e.features[0].properties.crop0);
          setLandArea(e.features[0].properties.landarea);
          setWeight(e.features[0].properties.weight.toFixed(5));
          setFineIndexY(e.features[0].properties.index_y);
          setFineIndexX(e.features[0].properties.index_x);
          setCost(e.features[0].properties.cost);
        }
      });

      map.on('click', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['coarse_grid'],
        });

        if (features.length) {
          map.flyTo({
            center: [
              features[0].properties.center_lon,
              features[0].properties.center_lat,
            ],
            zoom: ZOOM_THRESHOLD + ZOOM_TOLERANCE,
            speed: 1,
          });
        }
      });
    });

    setMap(map);
  }, []);

  // Hover Highlighting

  useEffect(() => {
    if (map && hoveredIDCoarse) {
      map.setFeatureState(
        { source: 'coarse_grid', id: prevHoveredIDCoarse },
        { hover: false }
      );
      map.setFeatureState(
        { source: 'coarse_grid', id: hoveredIDCoarse },
        { hover: true }
      );
      setPrevHoveredIDCoarse(hoveredIDCoarse);
    }
  }, [hoveredIDCoarse, prevHoveredIDCoarse, map]);

  useEffect(() => {
    if (context === 'fine') {
      if (map && hoveredIDFine) {
        map.setFeatureState(
          { source: 'fine_grid', id: prevHoveredIDFine },
          { hover: false }
        );
        map.setFeatureState(
          { source: 'fine_grid', id: hoveredIDFine },
          { hover: true }
        );
        setPrevHoveredIDFine(hoveredIDFine);
      }
    }
  }, [context, hoveredIDFine, prevHoveredIDFine, map]);

  // Setting Fine Grid

  function getFineGrid(y, x, costs_displayed = false) {
    let request_url;
    if (costs_displayed) {
      // request_url = `http://localhost:5000/api/costs_from_point/${y}/${x}`;
      request_url = `http://longrungrowth.huma-num.fr/gridviewer-backend/api/costs_from_point/${y}/${x}`;
    } else {
      // request_url = `http://localhost:5000/api/fine_grid/${y}/${x}`;
      request_url = `http://longrungrowth.huma-num.fr/gridviewer-backend/api/fine_grid/${y}/${x}`;
    }
    axios({
      method: 'GET',
      url: request_url,
    })
      .then((res) => {
        setCachedFineGrids(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (map) {
      if (zoom < ZOOM_THRESHOLD && context === 'fine') {
        setCachedFineGrids({});
        setContext('coarse');
        setViewMode('none');
        setNeighbor(null);
      } else if (zoom >= ZOOM_THRESHOLD && context === 'coarse') {
        const [y, x] = coordToIndexCoarse(lat, lng);
        getFineGrid(y, x);
        setContext('fine');
        setCenterGrid([y, x]);
      }
    }
  }, [zoom, context, lat, lng, map]);

  useEffect(() => {
    if (map && cachedFineGrids) {
      if (context === 'fine') {
        if (viewMode !== 'cost') {
          const [y, x] = coordToIndexCoarse(lat, lng);
          if (y !== centerGrid[0] || x !== centerGrid[1]) {
            console.log('center changed');
            getFineGrid(y, x);
            setCenterGrid([y, x]);
          }
        }
      }
    }
  }, [cachedFineGrids, context, centerGrid, viewMode, lat, lng, map]);

  const getRamp = useCallback(() => {
    if (view === 'elevation') {
      return [
        [-9999, '#000000'],
        [0, '#3288BD'],
        [100, '#509DB6'],
        [200, '#6EB2B0'],
        [300, '#8CC7AA'],
        [400, '#ABDDA4'],
        [500, '#BBDD9F'],
        [600, '#CCDE9A'],
        [700, '#DCDE95'],
        [800, '#EDDF90'],
        [900, '#FEE08B'],
        [1000, '#FDD483'],
        [1100, '#FCC97C'],
        [1200, '#FBBD75'],
        [1300, '#FAB26E'],
        [1400, '#F9A667'],
        [1500, '#F89B5F'],
        [1600, '#F78F58'],
        [1700, '#F68451'],
        [1800, '#F5784A'],
        [1900, '#F46D43'],
        [2000, '#E25742'],
        [2100, '#D14142'],
        [2200, '#C02C42'],
        [2300, '#AF1642'],
        [2400, '#9E0142'],
        [2500, '#8E0142'],
        [2600, '#7D0142'],
        [2700, '#6C0142'],
        [2800, '#5B0142'],
        [2900, '#4B0142'],
        [3000, '#3A0142'],
      ];
    } else if (view === 'landlake') {
      return [
        [-9999, '#ffffff'],
        [0, '#1b14e3'],
        [1, '#c41010'],
      ];
    } else if (view === 'forest') {
      return [
        [-9999, '#ffffff'],
        [0, '#1b14e3'],
        [1, '#c41010'],
      ];
    } else if (view === 'pop3000') {
      return [
        [-9999, '#000000'],
        [0, '#3288bd'],
        [1000, '#66c2a5'],
        [2000, '#abdda4'],
        [3000, '#e6f598'],
        [4000, '#fee08b'],
        [5000, '#fdae61'],
        [6000, '#f46d43'],
        [7000, '#d53e4f'],
      ];
    } else if (view === 'pop0') {
      return [
        [-9999, '#000000'],
        [0, '#3288bd'],
        [1000, '#66c2a5'],
        [2000, '#abdda4'],
        [3000, '#e6f598'],
        [4000, '#fee08b'],
        [5000, '#fdae61'],
        [6000, '#f46d43'],
        [7000, '#d53e4f'],
      ];
    } else if (view === 'crop0') {
      return [
        [-9999, '#000000'],
        [0, '#3288bd'],
        [10, '#66c2a5'],
        [20, '#abdda4'],
        [30, '#e6f598'],
        [40, '#fee08b'],
        [50, '#fdae61'],
        [60, '#f46d43'],
        [70, '#d53e4f'],
      ];
    } else if (view === 'landarea') {
      return [
        [-9999, '#000000'],
        [0, '#3288bd'],
        [10, '#66c2a5'],
        [20, '#abdda4'],
        [30, '#e6f598'],
        [40, '#fee08b'],
        [50, '#fdae61'],
        [60, '#f46d43'],
        [70, '#d53e4f'],
      ];
    } else if (view === 'weight') {
      return [
        //ranges from 0 to 0.01 in increments of 0.0005
        [-9999, '#000000'],
        [0, '#3288BD'],
        [0.0005, '#509DB6'],
        [0.001, '#6EB2B0'],
        [0.0015, '#8CC7AA'],
        [0.002, '#ABDDA4'],
        [0.0025, '#BBDD9F'],
        [0.003, '#CCDE9A'],
        [0.0035, '#DCDE95'],
        [0.004, '#EDDF90'],
        [0.0045, '#FEE08B'],
        [0.005, '#FDD483'],
        [0.0055, '#FCC97C'],
        [0.006, '#FBBD75'],
        [0.0065, '#FAB26E'],
        [0.007, '#F9A667'],
        [0.0075, '#F89B5F'],
        [0.008, '#F78F58'],
        [0.0085, '#F68451'],
        [0.009, '#F5784A'],
        [0.0095, '#F46D43'],
        [0.01, '#9E0142'],
      ];
    } else if (view === 'cost') {
      return [
        [-9999, '#000000'],
        [0, '#000000'],
        [25, '#3288BD'],
        [50, '#509DB6'],
        [75, '#6EB2B0'],
        [100, '#8CC7AA'],
        [125, '#ABDDA4'],
        [150, '#BBDD9F'],
        [175, '#CCDE9A'],
        [200, '#DCDE95'],
        [225, '#EDDF90'],
        [250, '#FEE08B'],
        [275, '#FCC97C'],
        [300, '#FAB26E'],
        [325, '#F89B5F'],
        [350, '#F68451'],
        [375, '#F46D43'],
        [400, '#E25742'],
        [425, '#D14142'],
        [450, '#C02C42'],
        [475, '#AF1642'],
        [500, '#9E0142'],
      ];
    }
  }, [view]);

  useEffect(() => {
    if (map && cachedFineGrids) {
      if (context === 'fine') {
        map.getSource('fine_grid').setData(cachedFineGrids);
        map.addLayer(
          {
            id: 'fine_grid',
            type: 'fill',
            maxzoom: 22,
            source: 'fine_grid',
            interactive: true,
            paint: {
              'fill-color': '#000000',
              'fill-opacity': 0.4,
            },
          },
          'coarse_grid'
        );
        map.addLayer({
          id: 'fine_lines',
          type: 'line',
          maxzoom: 22,
          source: 'fine_grid',
          interactive: true,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': 'rgba(0,0,0,0.3)',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2,
              0.5,
            ],
          },
        });
        if (view === 'none') {
          map.setPaintProperty('fine_grid', 'fill-color', 'rgba(0,0,0,0)');
        } else {
          const ramp = getRamp();
          map.setPaintProperty('fine_grid', 'fill-color', {
            property: view,
            stops: ramp,
          });
        }
      } else {
        map.removeLayer('fine_grid');
        map.removeLayer('fine_lines');
        map.getSource('fine_grid').setData(cachedFineGrids);
      }
    }
  }, [context, cachedFineGrids, view, getRamp, map]);

  useEffect(() => {
    if (map) {
      if (view === 'none') {
        map.setPaintProperty('fine_grid', 'fill-color', 'rgba(0,0,0,0)');
      } else {
        const ramp = getRamp();
        map.setPaintProperty('fine_grid', 'fill-color', {
          property: view,
          stops: ramp,
        });
      }
    }
  }, [view, getRamp, map]);

  useEffect(() => {
    if (map && neighbor) {
      if (neighbor !== prevNeighbor) {
        const y = fineIndexY;
        const x = fineIndexX;
        getFineGrid(y, x, true);
        setPrevNeighbor(neighbor);
      }
    }
  }, [neighbor, prevNeighbor, fineIndexY, fineIndexX, map]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.keyCode === 32 && context === 'fine') {
        console.log('spacebar pressed');
        setNeighbor((state) => {
          return state + 1;
        });
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [context]);

  // detect the spacebar keypress

  return (
    <div>
      {context === 'coarse' ? (
        <div className="sidebar">
          {' '}
          <div>
            Index: ({coarseIndexX}, {coarseIndexY})
          </div>
        </div>
      ) : (
        <div className="sidebar">
          {' '}
          <div>
            Index: ({fineIndexX}, {fineIndexY})
          </div>
          <div>Tile Elevation: {elevation}</div> <div>Land: {landlake}</div>{' '}
          <div>Forest: {forest}</div> <div>Max. Land Area: {landarea}</div>
          <div>Pop 3000BC: {pop3000}</div> <div>Pop 0AD: {pop0}</div>{' '}
          <div>Cropland 0AD: {crop0}</div> <div>Sample Weight: {weight}</div>{' '}
          <div>Cost: {cost}</div>
        </div>
      )}
      {context === 'fine' && (
        <Options view={view} setView={setView} setViewMode={setViewMode} />
      )}
      <div className="map-container" ref={mapContainer} />
    </div>
  );
}
