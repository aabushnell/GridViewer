import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import data from './coarse_grid.json';

import Options from './components/Options.js';

import { coordToIndexCoarse } from './helpers.js';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWFidXNobmVsbCIsImEiOiJjbG5hYnFkZGYwMmpuMm5tcWR6ZXhkeTI4In0.1N86NiPVYwfxJ3Q-Ldi_Pw';

const ZOOM_THRESHOLD = 6;
const ZOOM_TOLERANCE = 0.2;

export default function Map() {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  const [lng, setLng] = useState(10);
  const [lat, setLat] = useState(-40);

  const [mouseLng, setMouseLng] = useState(null);
  const [mouseLat, setMouseLat] = useState(null);

  const [zoom, setZoom] = useState(2);
  const [prevZoom, setPrevZoom] = useState(2);

  const [hoveredIDCoarse, setHoveredIDCoarse] = useState(null);
  const [prevHoveredIDCoarse, setPrevHoveredIDCoarse] = useState(null);

  const [hoveredIDFine, setHoveredIDFine] = useState(null);
  const [prevHoveredIDFine, setPrevHoveredIDFine] = useState(null);

  const [context, setContext] = useState('coarse');

  const [elevation, setElevation] = useState(null);
  const [landlake, setLandLake] = useState(null);
  const [view, setView] = useState('none');

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
            // point to our third-party tiles. Note that some examples
            // show a "url" property. This only applies to tilesets with
            // corresponding TileJSON (such as mapbox tiles).
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

      map.on('mousemove', (e) => {
        setMouseLat(e.lngLat.lat.toFixed(4));
        setMouseLng(e.lngLat.lng.toFixed(4));
      });

      map.on('mousemove', 'coarse_grid', (e) => {
        if (e.features.length > 0) {
          setHoveredIDCoarse(e.features[0].id);
        }
      });

      map.on('mousemove', 'fine_grid', (e) => {
        if (e.features.length > 0) {
          setHoveredIDFine(e.features[0].id);
          setElevation(e.features[0].properties.elevation);
          setLandLake(e.features[0].properties.landlake);
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

  useEffect(() => {
    if (map) {
      if (zoom < ZOOM_THRESHOLD && prevZoom >= ZOOM_THRESHOLD) {
        // map.removeLayer('fine_grid');
        // map.removeLayer('fine_lines');
        setCachedFineGrids({});
        // map.getSource('fine_grid').setData({});

        setContext('coarse');
      } else if (zoom >= ZOOM_THRESHOLD && prevZoom < ZOOM_THRESHOLD) {
        const [y, x] = coordToIndexCoarse(lat, lng);

        axios({
          method: 'GET',
          url: `http://localhost:5000/api/fine_grid/${y}/${x}`,
        })
          .then((res) => {
            setCachedFineGrids(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
        setContext('fine');
        setCenterGrid([y, x]);
      }
    }
    setPrevZoom(zoom);
  }, [zoom, prevZoom, lat, lng, map]);

  useEffect(() => {
    if (map && cachedFineGrids) {
      const [y, x] = coordToIndexCoarse(lat, lng);
      if (y !== centerGrid[0] || x !== centerGrid[1]) {
        axios({
          method: 'GET',
          url: `http://localhost:5000/api/fine_grid/${y}/${x}`,
        })
          .then((res) => {
            setCachedFineGrids(res.data);
          })
          .catch((err) => {
            console.log(err);
          });
        setCenterGrid([y, x]);
      }
    }
  }, [cachedFineGrids, centerGrid, lat, lng, map]);

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
              'fill-opacity': 0.25,
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
        drawView();
      } else {
        map.removeLayer('fine_grid');
        map.removeLayer('fine_lines');
        map.getSource('fine_grid').setData(cachedFineGrids);
      }
    }
  }, [context, cachedFineGrids, map]);

  function drawView() {
    if (view === 'none') {
      map.setPaintProperty('fine_grid', 'fill-color', 'rgba(0,0,0,0)');
    } else if (view === 'elevation') {
      map.setPaintProperty('fine_grid', 'fill-color', {
        property: 'elevation',
        stops: [
          [0, '#3288bd'],
          [1000, '#66c2a5'],
          [2000, '#abdda4'],
          [3000, '#e6f598'],
          [4000, '#fee08b'],
          [5000, '#fdae61'],
          [6000, '#f46d43'],
          [7000, '#d53e4f'],
        ],
      });
    } else if (view === 'landlake') {
      map.setPaintProperty('fine_grid', 'fill-color', {
        property: 'landlake',
        stops: [
          [-9999, '#ffffff'],
          [0, '#1b14e3'],
          [1, '#c41010'],
        ],
      });
    }
  }

  useEffect(() => {
    if (map) {
      drawView();
    }
  }, [view, map]);

  function changeGrid() {}

  return (
    <div>
      <div className="sidebar">
        {' '}
        <div>Tile Elevation: {elevation}</div> <div>Land: {landlake}</div>
      </div>
      <Options view={view} setView={setView} />
      <div className="map-container" ref={mapContainer} />
    </div>
  );
}
