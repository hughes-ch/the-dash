/**
 *   Defines tests for the DetailedStatusBubble
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import DetailedStatusBubble from './detailed-status-bubble';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('correctly renders props', () => {
  const numApps = 2;
  const lastUpdate = '1 hour ago';
  const nextUpdate = '2 hours';
  
  render(<DetailedStatusBubble numApps={numApps}
                               lastUpdate={lastUpdate}
                               nextUpdate={nextUpdate}/>);
  
  const numAppsText = screen.queryByText(numApps);
  const lastUpdateText = screen.queryByText(lastUpdate);
  const nextUpdateText = screen.queryByText(nextUpdate);
  expect(numAppsText).not.toBe(null);
  expect(lastUpdateText).not.toBe(null);
  expect(nextUpdateText).not.toBe(null);
});

