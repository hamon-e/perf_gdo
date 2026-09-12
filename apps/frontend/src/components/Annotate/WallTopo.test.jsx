import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import WallTopo from './WallTopo';

const laneOne = {
  id: '1',
  coords: [230, 1354, 382, 1250, 332, 65, 153, 23],
};

const laneTwo = {
  id: '2',
  coords: [500, 1354, 652, 1250, 602, 65, 423, 23],
};

const slopedLaneEleven = {
  id: '11',
  coords: [975, 1378, 1025, 1371, 1027, 1104, 1025, 1010, 1030, 535, 1039, 292, 1048, 94, 975, 92, 963, 292, 952, 536, 947, 1016, 956, 1114],
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
      onLaneClick={vi.fn()}
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
      onLaneClick={vi.fn()}
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
      onLaneClick={vi.fn()}
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

test('takes the actual top edge for steep lanes', () => {
  const { container } = render(
    <WallTopo
      areas={[slopedLaneEleven]}
      routes={[{ id: 45, couloir_id: 11, color: '#ffff00', difficulty: 8 }]}
      coordinateScale={1}
      onLaneClick={vi.fn()}
    />,
  );

  const end = container.querySelectorAll('.wall-topo__endpoint')[1];
  // The lane's exit is around y=93; it must not stop at the y=292 bend.
  expect(Number(end.getAttribute('cy'))).toBeLessThan(110);
});

test('centres lane one routes on its sloped top edge', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={[routes[0]]}
      coordinateScale={1}
      onLaneClick={vi.fn()}
    />,
  );

  const end = container.querySelectorAll('.wall-topo__endpoint')[1];
  expect(Number(end.getAttribute('cx'))).toBeGreaterThan(200);
});

test('still opens the lane record on lane click', () => {
  const onLaneClick = vi.fn();
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
      onLaneClick={vi.fn()}
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
      onLaneClick={vi.fn()}
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
      onLaneClick={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByLabelText('Zoomer'));
  const viewport = container.querySelector('.wall-topo-viewport');
  const content = container.querySelector('.wall-topo');
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
  Object.defineProperty(content, 'offsetWidth', { configurable: true, value: 820 });
  Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 500 });
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  fireTouch('touchstart', [[100, 100]]);
  fireTouch('touchmove', [[50, 50]]);
  fireTouch('touchend', []);

  expect(content.style.transform).toBe('translate(-75px, -75px) scale(1.5)');
});

test('pinching out back to zoom one restores native scroll when far right', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={vi.fn()}
    />,
  );

  const scroll = container.querySelector('.wall-topo-scroll');
  const viewport = container.querySelector('.wall-topo-viewport');
  const content = container.querySelector('.wall-topo');
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
  Object.defineProperty(content, 'offsetWidth', { configurable: true, value: 820 });
  Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 500 });
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  // Utilisateur tout à droite en défilement natif, puis pincement dézoomant.
  scroll.scrollLeft = 520;
  fireTouch('touchstart', [[50, 100], [150, 100]]);
  fireTouch('touchmove', [[75, 100], [125, 100]]);
  fireTouch('touchend', []);

  expect(content.style.transform).toBe('');
  expect(scroll.scrollLeft).toBe(520);
  expect(container.querySelector('.wall-topo-viewport--zoomed')).toBeNull();
});

test('pinching back in after hitting the zoom floor keeps the view continuous', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={vi.fn()}
    />,
  );

  const scroll = container.querySelector('.wall-topo-scroll');
  const viewport = container.querySelector('.wall-topo-viewport');
  const content = container.querySelector('.wall-topo');
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
  Object.defineProperty(content, 'offsetWidth', { configurable: true, value: 820 });
  Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 500 });
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  scroll.scrollLeft = 520;
  fireTouch('touchstart', [[50, 100], [150, 100]]);
  // Dézoome sous le plancher puis re-zoome sans lever les doigts.
  fireTouch('touchmove', [[75, 100], [125, 100]]);
  fireTouch('touchmove', [[25, 100], [175, 100]]);

  expect(scroll.scrollLeft).toBe(0);
  expect(content.style.transform).toContain('scale(3)');
  // Le milieu du pincement (x = 100) doit rester ancré sur le même point du mur.
  const translate = content.style.transform.match(/translate\(([-\d.]+)px/);
  const contentX = (100 - Number(translate[1])) / 3;
  expect(contentX).toBeCloseTo(620, 0);
});

test('zoom out button landing on zoom one hands the position back to native scroll', () => {
  const { container } = render(
    <WallTopo
      areas={[laneOne]}
      routes={routes}
      coordinateScale={1}
      mobile
      onLaneClick={vi.fn()}
    />,
  );

  const scroll = container.querySelector('.wall-topo-scroll');
  const viewport = container.querySelector('.wall-topo-viewport');
  const content = container.querySelector('.wall-topo');
  Object.defineProperty(viewport, 'clientWidth', { configurable: true, value: 300 });
  Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
  Object.defineProperty(content, 'offsetWidth', { configurable: true, value: 820 });
  Object.defineProperty(content, 'offsetHeight', { configurable: true, value: 500 });
  const fireTouch = (type, points) => {
    const event = new Event(type);
    event.touches = points.map(([x, y]) => ({ clientX: x, clientY: y }));
    fireEvent(viewport, event);
  };

  fireEvent.click(screen.getByLabelText('Zoomer'));
  fireTouch('touchstart', [[100, 100]]);
  fireTouch('touchmove', [[-1000, 100]]);
  fireTouch('touchend', []);
  expect(content.style.transform).toContain('translate(-930px');

  fireEvent.click(screen.getByLabelText('Dézoomer'));
  expect(content.style.transform).toBe('');
  expect(scroll.scrollLeft).toBe(520);
  expect(container.querySelector('.wall-topo-viewport--zoomed')).toBeNull();
});
