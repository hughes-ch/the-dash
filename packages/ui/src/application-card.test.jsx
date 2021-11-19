/**
 *   Defines tests for the ApplicationCard
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import ApplicationCard from './application-card';
import {render, screen} from '@testing-library/react';

/**
 * Unit tests
 */
it('Renders correctly when not down and not loading', () => {
  const numDaysSinceChange = 4;
  const lastChangeDate = new Date(
    new Date().valueOf() - (numDaysSinceChange * 1000 * 60 * 60 * 24));
  
  const application = 'blog.chrishughesdev.com';
  const mockDelete = jest.fn();
  const mockRefresh = jest.fn();
  
  render(
    <ApplicationCard
      app={application}
      isDown={false}
      isLoading={false}
      lastStatusChange={lastChangeDate}
      onDeleteClick={mockDelete}
      onRefreshClick={mockRefresh}/>
  );

  const deleteButton = document.getElementsByName('delete')[0].click();
  const refreshButton = screen.getByText('Refresh').click();

  // Check the X and refresh buttons can be selected
  expect(mockDelete).toHaveBeenCalledTimes(1);
  expect(mockRefresh).toHaveBeenCalledTimes(1);
  
  // Check that the application is correctly displayed
  expect(screen.queryByText(application)).not.toBe(null);
  
  // Check that the stable time length is calculated correctly
  const expectedStableText = `Stable for ${numDaysSinceChange} days`;
  expect(screen.queryByText(expectedStableText)).not.toBe(null);
  
  // Check that the indicator light looks right
  expect(screen.queryByText('Good')).not.toBe(null);
});

it('renders correctly when down and not loading', () => {
  const numDaysSinceChange = 4;
  const lastChangeDate = new Date(
    new Date().valueOf() - (numDaysSinceChange * 1000 * 60 * 60 * 24));
  
  render(
    <ApplicationCard
      app='blog.chrishughesdev.com'
      isDown={true}
      isLoading={false}
      lastStatusChange={lastChangeDate}
      onDeleteClick={undefined}
      onRefreshClick={undefined}/>
  );

  // Check that the down time length is calculated correctly
  const expectedDownTimeText = `Down for ${numDaysSinceChange} days`;
  expect(screen.queryByText(expectedDownTimeText)).not.toBe(null);
  
  // Check that the indicator light looks right
  expect(screen.queryByText('Down')).not.toBe(null);
});

it('renders correctly when down and loading', () => {
  const numDaysSinceChange = 1;
  const lastChangeDate = new Date(
    new Date().valueOf() - (numDaysSinceChange * 1000 * 60 * 60 * 24));
  
  const mockDelete = jest.fn();
  const mockRefresh = jest.fn();
  
  render(
    <ApplicationCard
      app='blog.chrishughesdev.com'
      isDown={true}
      isLoading={true}
      lastStatusChange={lastChangeDate}
      onDeleteClick={mockDelete}
      onRefreshClick={mockRefresh}/>
  );

  // Check the refresh button is disabled
  const button = document.getElementsByName('refresh')[0];
  expect(button.disabled).toBe(true);
  
  // Check that the down time length is calculated correctly
  const expectedDownTimeText = `Down for ${numDaysSinceChange} day`;
  expect(screen.queryByText(expectedDownTimeText)).not.toBe(null);
});

it('renders correctly when date is invalid', () => {
  render(
    <ApplicationCard
      app='blog.chrishughesdev.com'
      isDown={false}
      isLoading={false}
      lastStatusChange={'seventy-five'}
      onDeleteClick={undefined}
      onRefreshClick={undefined}/>
  );
});
