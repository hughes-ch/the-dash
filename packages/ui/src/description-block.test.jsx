/**
 *   Defines tests for the DescriptionBlock
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import DescriptionBlock from './description-block';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders', () => {
  render(<DescriptionBlock />);
  expect(screen.getByRole('heading').textContent).toContain('Dash');
});
