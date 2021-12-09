/**
 *   Defines tests for the BubbleContainer
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import BubbleContainer from './bubble-container';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('renders with correct props', () => {
  const expectedText = 'hello';
  const expectedColor = 'red';
  
  render(
    <BubbleContainer size='large' color={expectedColor}>
      {expectedText}
    </BubbleContainer>
  );
  
  const style = screen.getByText(expectedText).style;
  expect(style.backgroundColor).toEqual(expectedColor);
});
