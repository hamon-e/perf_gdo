import React, { useMemo } from 'react';

import './WallTopo.css';

const WALL_WIDTH = 2604;
const WALL_HEIGHT = 1596;

function average(points) {
  return points.reduce((result, point) => ({
    x: result.x + point.x / points.length,
    y: result.y + point.y / points.length,
  }), { x: 0, y: 0 });
}

function interpolate(from, to, amount) {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  };
}

function laneGeometry(area, coordinateScale) {
  const points = [];
  for (let index = 0; index < area.coords.length; index += 2) {
    points.push({
      x: area.coords[index] * coordinateScale,
      y: area.coords[index + 1] * coordinateScale,
    });
  }

  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const height = maxY - minY;
  const topPoints = points.filter((point) => point.y <= minY + height * 0.18);
  const bottomPoints = points.filter((point) => point.y >= maxY - height * 0.18);
  const top = average(topPoints.length ? topPoints : points);
  const rawBottom = average(bottomPoints.length ? bottomPoints : points);
  const laneId = Number(area.id);

  // Le départ du couloir 1 est réellement surélevé par rapport au sol.
  // Les autres tracés gardent simplement une petite marge au pied du mur.
  const bottom = interpolate(rawBottom, top, laneId === 1 ? 0.13 : 0.035);

  return {
    id: laneId,
    top,
    bottom,
    width: maxX - minX,
    polygon: points.map((point) => `${point.x},${point.y}`).join(' '),
  };
}

function fmt(value) {
  return Math.round(value * 100) / 100;
}

function smoothPath(points) {
  let d = `M ${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[Math.max(0, index - 1)];
    const start = points[index];
    const end = points[index + 1];
    const after = points[Math.min(points.length - 1, index + 2)];
    const firstControl = {
      x: start.x + (end.x - before.x) / 6,
      y: start.y + (end.y - before.y) / 6,
    };
    const secondControl = {
      x: end.x - (after.x - start.x) / 6,
      y: end.y - (after.y - start.y) / 6,
    };
    d += ` C ${fmt(firstControl.x)} ${fmt(firstControl.y)}, ${fmt(secondControl.x)} ${fmt(secondControl.y)}, ${fmt(end.x)} ${fmt(end.y)}`;
  }
  return d;
}

function seededNoise(seed, step) {
  const value = Math.sin(seed * 127.1 + step * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function routePath(geometry, offset, route) {
  const { bottom, top } = geometry;
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const normal = { x: -dy / length, y: dx / length };
  const seed = Number(route.id) || 0;

  // Ondulation façon topo : une base sinusoïdale discrète perturbée par un
  // bruit déterministe propre à la voie, le tout amorti aux extrémités.
  const amplitude = Math.min(geometry.width * 0.055, 11);
  const primaryWaves = seed % 2 === 0 ? 2 : 3;
  const secondaryGain = seed % 3 === 0 ? 0.4 : -0.25;
  const steps = 10;
  const samples = [];
  for (let step = 0; step <= steps; step += 1) {
    const progress = step / steps;
    const envelope = Math.sin(progress * Math.PI);
    const wave = amplitude * Math.sin(progress * Math.PI * primaryWaves)
      + amplitude * secondaryGain * Math.sin(progress * Math.PI * (primaryWaves + 2))
      + amplitude * 0.6 * (seededNoise(seed, step) - 0.5) * 2 * envelope;
    const lateral = offset + wave;
    samples.push({
      x: bottom.x + dx * progress + normal.x * lateral,
      y: bottom.y + dy * progress + normal.y * lateral,
    });
  }

  return {
    d: smoothPath(samples),
    start: samples[0],
    end: samples[samples.length - 1],
  };
}

export default function WallTopo({ areas, routes, coordinateScale, mobile, onLaneClick }) {
  const geometries = useMemo(() => areas.map((area) => laneGeometry(area, coordinateScale)), [areas, coordinateScale]);
  const routesByLane = useMemo(() => routes.reduce((result, route) => {
    const lane = route.couloir_id;
    if (!result[lane]) result[lane] = [];
    result[lane].push(route);
    result[lane].sort((first, second) => first.difficulty - second.difficulty);
    return result;
  }, {}), [routes]);

  return (
    <div className="wall-topo-scroll">
      <div className={mobile ? 'wall-topo wall-topo--mobile' : 'wall-topo'}>
        <svg
          className="wall-topo__svg"
          viewBox={`0 0 ${WALL_WIDTH} ${WALL_HEIGHT}`}
          role="img"
          aria-label="Topo interactif du mur principal"
        >
          <image href="/gdo.png" x="0" y="0" width={WALL_WIDTH} height={WALL_HEIGHT} />

          <g className="wall-topo__lanes">
            {geometries.map((geometry) => (
              <polygon
                key={geometry.id}
                points={geometry.polygon}
                className="wall-topo__lane-hit"
                onClick={() => onLaneClick({ id: String(geometry.id) })}
              />
            ))}
          </g>

          <g className="wall-topo__routes">
            {geometries.flatMap((geometry) => {
              const laneRoutes = routesByLane[geometry.id] || [];
              const maxOffset = Math.min(geometry.width * 0.18, 26);
              return laneRoutes.map((route, index) => {
                const offset = laneRoutes.length === 1
                  ? 0
                  : -maxOffset + (2 * maxOffset * index) / (laneRoutes.length - 1);
                const path = routePath(geometry, offset, route);
                return (
                  <g key={route.id} className="wall-topo__route">
                    <path d={path.d} className="wall-topo__route-line" style={{ stroke: route.color }} />
                    <circle cx={path.start.x} cy={path.start.y} r="4" className="wall-topo__endpoint" style={{ fill: route.color }} />
                    <circle cx={path.end.x} cy={path.end.y} r="4" className="wall-topo__endpoint" style={{ fill: route.color }} />
                  </g>
                );
              });
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
