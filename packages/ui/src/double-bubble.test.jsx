/**
 *   Defines tests for the DoubleBubble component
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import DoubleBubble from './double-bubble';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders with correct props', () => {
  const text1 = 'Hello';
  const text2 = 'World!';
  render(
    <DoubleBubble>
      <h1>{text1}</h1>
      <h2>{text2}</h2>
    </DoubleBubble>
  );
  
  expect(screen.queryByText(text1)).toBeInTheDocument();
  expect(screen.queryByText(text2)).toBeInTheDocument();
});
