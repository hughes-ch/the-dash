/**
 *   Defines tests for the DeleteApplicationPopup
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import DeleteApplicationPopup from './delete-application-popup';
import {fireEvent, render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('Submits a form', () => {
  const appName = 'appName';
  const mockCancel = jest.fn();
  const mockSubmit = jest.fn();
  render(<DeleteApplicationPopup onSubmit={mockSubmit}
                                 app={appName}
                                 onCancel={mockCancel}/>);

  screen.getByText('Oops, nope').click();
  fireEvent.submit(document.getElementsByName('popup-form')[0]);
  
  expect(screen.queryByText(appName)).not.toBe(null);
  expect(mockCancel).toHaveBeenCalledTimes(1);
  expect(mockSubmit).toHaveBeenCalledTimes(1);
});
