import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import WallTopo from './WallTopo';

const laneOne = {
  id: '1',
  coords: [230, 1354, 382, 1250, 332, 65, 153, 23],
};

const laneTwo = {
  id: '2',
  coords: [500, 1354, 652, 1250, 602, 65, 423, 23],
};

const routes = [
  { id: 42, couloir_id: 1, color: '#e53935', difficulty: 6.25 },
  { id: 43, couloir_id: 1, color: '#43a047', difficulty: 5.5 },
  { id: 44, couloir_id: 2, color: '#1e88e5', difficulty: 6.75 },
];

test('draws one non-clickable line per route without grade labels', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne, laneTwo]}
      routes={routes}
      coordinateScale={1}
      onLaneClick={jest.fn()}
    />,
  );

  const lines = container.querySelectorAll('.wall-topo__route-line');
  expect(lines).toHaveLength(3);
  lines.forEach((line) => {
    expect(line.getAttribute('d')).not.toContain('NaN');
  });
  expect(container.querySelector('.wall-topo__grade')).toBeNull();
  expect(container.querySelector('.wall-topo__route-halo')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

test('spreads several routes of the same lane apart', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes.filter((route) => route.couloir_id === 1)}
      coordinateScale={1}
      onLaneClick={jest.fn()}
    />,
  );

  const startXs = [...container.querySelectorAll('.wall-topo__route-line')]
    .map((line) => Number(line.getAttribute('d').match(/^M ([\d.]+)/)[1]));
  expect(startXs).toHaveLength(2);
  expect(Math.abs(startXs[0] - startXs[1])).toBeGreaterThan(10);
});

test('draws winding lines instead of straight chords', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={[routes[0]]}
      coordinateScale={1}
      onLaneClick={jest.fn()}
    />,
  );

  const d = container.querySelector('.wall-topo__route-line').getAttribute('d');
  const numbers = d.match(/-?[\d.]+/g).map(Number);
  const startX = numbers[0];
  const startY = numbers[1];
  const endX = numbers[numbers.length - 2];
  const endY = numbers[numbers.length - 1];
  const chordDx = endX - startX;
  const chordDy = endY - startY;
  const chordLength = Math.sqrt(chordDx * chordDx + chordDy * chordDy);
  const controlPoints = [];
  for (let index = 2; index < numbers.length - 4; index += 6) {
    controlPoints.push([numbers[index], numbers[index + 1]]);
  }
  const maxDeviation = Math.max(...controlPoints.map(([x, y]) => (
    Math.abs((x - startX) * chordDy - (y - startY) * chordDx) / chordLength
  )));

  expect(d.match(/ C /g)).toHaveLength(10);
  expect(maxDeviation).toBeGreaterThan(5);
});

test('still opens the lane record on lane click', () => {
  const onLaneClick = jest.fn();
  render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      onLaneClick={onLaneClick}
    />,
  );

  const lane = screen.getByLabelText('Topo interactif du mur principal')
    .querySelector('.wall-topo__lane-hit');
  fireEvent.click(lane);
  expect(onLaneClick).toHaveBeenCalledWith({ id: '1' });
});

test('mobile zoom controls scale the wall then reset', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={jest.fn()}
    />,
  );

  expect(container.querySelector('.wall-topo-viewport--zoomed')).toBeNull();

  fireEvent.click(screen.getByLabelText('Zoomer'));
  expect(container.querySelector('.wall-topo-viewport--zoomed')).not.toBeNull();
  const content = container.querySelector('.wall-topo');
  expect(content.style.transform).toContain('scale(1.5)');

  fireEvent.click(screen.getByLabelText('Dézoomer'));
  expect(container.querySelector('.wall-topo-viewport--zoomed')).toBeNull();
  expect(content.style.transform).toBe('');
});

test('pinch gesture zooms the wall on mobile', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={jest.fn()}
    />,
  );

  const viewport = container.querySelector('.wall-topo-viewport');
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  fireTouch('touchstart', [[0, 0], [100, 0]]);
  fireTouch('touchmove', [[0, 0], [200, 0]]);
  fireTouch('touchend', [[100, 0]]);

  expect(container.querySelector('.wall-topo').style.transform).toContain('scale(2)');
});

test('single finger drag pans the wall while zoomed', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByLabelText('Zoomer'));
  const viewport = container.querySelector('.wall-topo-viewport');
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  fireTouch('touchstart', [[0, 0]]);
  fireTouch('touchmove', [[0, 0]]);
  fireTouch('touchend', []);

  expect(container.querySelector('.wall-topo').style.transform).toBe('translate(0px, 0px) scale(1.5)');
});
