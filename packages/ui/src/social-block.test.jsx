/**
 *   Defines tests for the SocialBlock
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import SocialBlock from './social-block';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders', () => {
  render(<SocialBlock />);
  expect(screen.getByAltText('Website Logo').parentNode.getAttribute('href'))
    .toEqual('https://blog.chrishughesdev.com');
});
