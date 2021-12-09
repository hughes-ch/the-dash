/**
 *   Defines tests for the Dashboard
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
import '@testing-library/jest-dom';
import config from './app-config';
import Dashboard from './dashboard';
import {render,
        screen,
        waitFor,
        waitForElementToBeRemoved} from '@testing-library/react';
import {rest} from 'msw';
import {setupServer} from 'msw/node';
import {within} from '@testing-library/dom';

/**
 * Initial setup
 */
jest.setTimeout(config.DASHBOARD_ERROR_TIMEOUT * 10);

const threeDaysAgo = new Date(
  new Date().valueOf() - (3 * 24 * 60 * 60 * 1000));
const oneDayAgo = new Date(
  new Date().valueOf() - (1 * 24 * 60 * 60 * 1000));
const twoHoursAgo = new Date(
  new Date().valueOf() - (2 * 60 * 60 * 1000));
const oneHourAgo = new Date(
  new Date().valueOf() - (1 * 60 * 60 * 1000));
const oneHourInFuture = new Date(
  new Date().valueOf() + (1 * 60 * 60 * 1000));
const twoHoursInFuture = new Date(
  new Date().valueOf() + (2 * 60 * 60 * 1000));
const twoDaysInFuture = new Date(
  new Date().valueOf() + (2 * 24 * 60 * 60 * 1000));

const server = setupServer(
  rest.get('/sites', (req, res, ctx) => {
    return res(ctx.json({
      sites: []
    }));
  }),
  rest.put('/sites/:app', (req, res, ctx) => {
    const {app} = req.params;

    if (app === 'error.com') {
      return res(ctx.status(500));
    }

    return res(ctx.json({
      name: app,
      isDown: false,
      lastStatusChange: threeDaysAgo.toString(),
      lastStatusUpdate: oneHourAgo.toString(),
      nextAutomatedUpdate: twoHoursInFuture.toString(),
    }));
  }),
);

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});

afterAll(() => {
  server.close();
});

/**
 * Unit tests
 */
it('renders correctly with 0 components', async () => {
  render(<Dashboard/>);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(document.getElementsByClassName('error-bar').length).toEqual(0);
  expect(await screen.findByText('No Alarms')).toBeInTheDocument();
         
  const details = document.getElementsByClassName('large')[0];
  expect(/Applications:\s?0/.test(details.textContent)).toBe(true);
  expect(/Last Status Update:\s?Never/.test(details.textContent)).toBe(true);
  expect(/Next Status Update:\s?Never/.test(details.textContent)).toBe(true);

  expect(screen.queryByText('Refresh All')).toBeInTheDocument();
});

it('displays a down application', async () => {
  const upAppName = 'up.com';
  const downAppName = 'down.com';

  server.use(
    rest.get('/sites', (req, res, ctx) => {
      
      return res(ctx.json({
        sites: [
          {
            name: upAppName,
            isDown: false,
            lastStatusChange: threeDaysAgo.toString(),
            lastStatusUpdate: oneHourAgo.toString(),
            nextAutomatedUpdate: twoHoursInFuture.toString(),
          },
          {
            name: downAppName,
            isDown: true,
            lastStatusChange: oneDayAgo.toString(),
            lastStatusUpdate: twoHoursAgo.toString(),
            nextAutomatedUpdate: oneHourInFuture.toString(),
          },
        ]
      }));
    }));
  
  render(<Dashboard/>);

  await waitFor(() => screen.getByText(downAppName));
  
  expect(screen.queryByText('Good')).toBeInTheDocument();
  expect(screen.queryByText('Down')).toBeInTheDocument();  
  expect(screen.queryByText('Down for 1 day')).toBeInTheDocument();  

  const details = document.getElementsByClassName('large')[0];
  expect(/Applications:\s?2/.test(details.textContent)).toBe(true);
  expect(/Last Status Update:\s?1 hour ago/.test(details.textContent)).toBe(true);
  expect(/Next Status Update:\s?1 hour/.test(details.textContent)).toBe(true);

  const links = screen.queryAllByRole('link');
  const hrefs = links.map((e) => e.getAttribute('href'));
  const sortedHrefs = Array.from(hrefs);
  sortedHrefs.sort();
  expect(hrefs).toEqual(sortedHrefs);
});

/**
 * Testing creating a new app
 */
describe('when creating a new app', () => {
  it('works correctly', async () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.json({
          sites: [
            {
              name: 'zzz.com',
              isDown: false,
              lastStatusChange: oneDayAgo.toString(),
              lastStatusUpdate: oneHourAgo.toString(),
              nextAutomatedUpdate: twoHoursInFuture.toString(),
            },
          ]
        }));
      }),
    );

    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();

    const newAppName = 'app.com';
    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = newAppName;
    screen.queryByText('Submit').click();
    
    expect(await screen.findByText(newAppName)).toBeInTheDocument();

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?2/.test(details.textContent)).toBe(true);
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent)).toBe(true);
    expect(/Next Status Update:\s?2 hours/.test(details.textContent)).toBe(true);
    
    expect(await screen.findByText('Stable for 3 days')).toBeInTheDocument();
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();

    const links = screen.queryAllByRole('link');
    const hrefs = links.map((e) => e.getAttribute('href'));
    const sortedHrefs = Array.from(hrefs);
    sortedHrefs.sort();
    expect(hrefs).toEqual(sortedHrefs);
  });

  it('can be cancelled', async () => {
    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();

    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = 'app.com';
    screen.queryByText('Cancel').click();

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?0/.test(details.textContent)).toBe(true);
  });

  it('can handle error from server', async () => {
    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();
    
    const newAppName = 'error.com';
    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = newAppName;
    screen.queryByText('Submit').click();
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?0/.test(details.textContent)).toBe(true);
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error from fetch', async () => {
    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();
    
    server.close();

    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = 'new.app';
    screen.queryByText('Submit').click();

    server.listen();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?0/.test(details.textContent)).toBe(true);

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error when parsing json', async () => {
    server.use(
      rest.put('/sites/:site', (req, res, ctx) => {
        return res(ctx.json(null), ctx.status(200));
      }),
    );
    
    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();

    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = 'new.app';
    screen.queryByText('Submit').click();
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?0/.test(details.textContent)).toBe(true);

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle malformed response', async () => {
    server.use(
      rest.put('/sites/:site', (req, res, ctx) => {
        return res(ctx.json({
          sites: undefined
        }));
      })
    );
    
    render(<Dashboard/>);
    expect(await screen.findByText('No Alarms')).toBeInTheDocument();
    
    screen.queryByText('Add Another URL').click();
    screen.queryByLabelText('Name').value = 'new.app';
    screen.queryByText('Submit').click();
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?0/.test(details.textContent)).toBe(true);

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });
});

/**
 * Testing deletion of an app
 */
describe('when deleting a new app', () => {
  const deleteTestParams = {
    sites: [
      {
        name: 'up.com',
        isDown: false,
        lastStatusChange: threeDaysAgo.toString(),
        lastStatusUpdate: oneHourAgo.toString(),
        nextAutomatedUpdate: twoHoursInFuture.toString(),
      },
      {
        name: 'down.com',
        isDown: true,
        lastStatusChange: threeDaysAgo.toString(),
        lastStatusUpdate: oneHourAgo.toString(),
        nextAutomatedUpdate: twoHoursInFuture.toString(),
      },
      {
        name: 'zzz.com',
        isDown: false,
        lastStatusChange: threeDaysAgo.toString(),
        lastStatusUpdate: oneHourAgo.toString(),
        nextAutomatedUpdate: twoHoursInFuture.toString(),
      },
    ]
  };

  const setupDeleteServer = () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.json({sites: deleteTestParams.sites}));
      }),
      rest.delete('/sites/:site', (req, res, ctx) => {
        const {site} = req.params;
        const remainingSites = deleteTestParams.sites.filter(
          (e) => e.name !== site);
        
        return res(ctx.json({sites: remainingSites}));
      }),
    );
  };

  it('works', async () => {
    setupDeleteServer();
    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));
    
    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();

    const popup = document.getElementsByClassName('popup-window')[0];
    const appToDelete = popup.textContent.match(
      /Delete This Application\?\s?(?<app>[\w.-]+com)/).groups.app;

    screen.getByText('Yup').click();
    await waitFor(() => {
      const details = document.getElementsByClassName('large')[0];
      expect(/Applications:\s?2/.test(details.textContent)).toBe(true);
    });
    
    const links = screen.queryAllByRole('link');
    const hrefs = links.map((e) => e.getAttribute('href'));
    const sortedHrefs = Array.from(hrefs);
    sortedHrefs.sort();
    expect(hrefs).toEqual(sortedHrefs);
  });

  it('can be cancelled', async () => {
    setupDeleteServer();
    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));

    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();
    
    const popup = document.getElementsByClassName('popup-window')[0];
    screen.getByText('Oops, nope').click();

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?3/.test(details.textContent)).toBe(true);
  });

  it('can handle error from server', async () => {
    setupDeleteServer();
    server.use(
      rest.delete('/sites/:site', (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );
    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));
    
    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();

    const popup = document.getElementsByClassName('popup-window')[0];
    screen.getByText('Yup').click();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?3/.test(details.textContent)).toBe(true);
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error from fetch', async () => {
    setupDeleteServer();
    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));

    server.close();    
    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();

    const popup = document.getElementsByClassName('popup-window')[0];
    screen.getByText('Yup').click();

    server.listen();
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?3/.test(details.textContent)).toBe(true);
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error when parsing JSON', async () => {
    setupDeleteServer();
    server.use(
      rest.delete('/sites/:site', (req, res, ctx) => {
        return res(ctx.json(null));
      }),
    );

    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));

    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();

    const popup = document.getElementsByClassName('popup-window')[0];
    screen.getByText('Yup').click();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });
    
    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?3/.test(details.textContent)).toBe(true);
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle malformed response', async () => {
    setupDeleteServer();
    server.use(
      rest.delete('/sites/:site', (req, res, ctx) => {
        return res(ctx.json({
          sites: undefined,
        }));
      }),
    );

    render(<Dashboard/>);
    await waitFor(() => screen.getByText(deleteTestParams.sites[0].name));    

    const deleteButtons = document.getElementsByClassName('delete-url-button');
    deleteButtons[0].click();

    const popup = document.getElementsByClassName('popup-window')[0];
    screen.getByText('Yup').click();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    const details = document.getElementsByClassName('large')[0];
    expect(/Applications:\s?3/.test(details.textContent)).toBe(true);
    
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });
});

/**
 * Loading initial app list
 */
describe('when getting the initial app list', () => {
  it('can handle error from server', async () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.status(200));
      }),
    );

    render(<Dashboard/>);
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    expect(screen.queryAllByText('N/A')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error from fetch', async () => {
    server.close();
    render(<Dashboard/>);
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });
    server.listen();

    expect(screen.queryAllByText('N/A')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error when parsing JSON', async () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.json(null));
      }),
    );

    render(<Dashboard/>);
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    expect(screen.queryAllByText('N/A')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle malformed response', async () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.json({
          sites: null
        }));
      }),
    );

    render(<Dashboard/>);
    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length)
        .toBeGreaterThan(0);
    });

    expect(screen.queryAllByText('N/A')[0]).toBeInTheDocument();

    await waitFor(() => {
      expect(document.getElementsByClassName('error-bar').length).toEqual(0);
    }, {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });
});

/**
 * Testing refreshing functionality
 */
describe('while refreshing app', () => {
  const refreshTestParams = {
    sites: [
      {
        name: 'appName1',
        isDown: false,
        lastStatusChange: threeDaysAgo,
        lastStatusUpdate: oneDayAgo,
        nextAutomatedUpdate: twoDaysInFuture,
      },
      {
        name: 'appName2',
        isDown: false,
        lastStatusChange: threeDaysAgo,
        lastStatusUpdate: oneHourAgo,
        nextAutomatedUpdate: twoDaysInFuture,
      },
    ]
  };

  const mockRefresh = jest.fn();

  const setupRefreshServer = () => {
    server.use(
      rest.get('/sites', (req, res, ctx) => {
        return res(ctx.json({
          sites: refreshTestParams.sites,
        }));
      }),
      rest.get('/sites/:app', (req, res, ctx) => {
        const {app} = req.params;
        mockRefresh(`/sites/${app}`);
        return res(ctx.json({
          name: app,
          isDown: false,
          lastStatusChange: threeDaysAgo.toString(),
          lastStatusUpdate: new Date().toString(),
          nextAutomatedUpdate: new Date().toString(),
        }));
      }),
    );
  };
  
  it('works', async () => {
    setupRefreshServer();
    render(<Dashboard/>);

    const refreshButtons = await(screen.findAllByText('Refresh'));
    const details = document.getElementsByClassName('large')[0];
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent))
      .toBe(true);
    expect(/Next Status Update:\s?2 days/.test(details.textContent))
      .toBe(true);
    
    refreshButtons[0].click();
    
    await waitFor(() => {
      const details = document.getElementsByClassName('large')[0];
      expect(/Last Status Update:\s?A few minutes ago/.test(details.textContent))
        .toBe(true);    
    });

    expect(mockRefresh).toHaveBeenCalled();
    expect(/Next Status Update:\s?Imminent/.test(details.textContent))
      .toBe(true);
  });

  it('can refresh all applications at once', async () => {
    setupRefreshServer();
    render(<Dashboard/>);
    await waitFor(() => screen.getByText(refreshTestParams.sites[0].name));

    screen.getByText('Refresh All').click();

    await waitFor(() => {
      const details = document.getElementsByClassName('large')[0];
      expect(/Last Status Update:\s?A few minutes ago/.test(details.textContent))
        .toBe(true);    
    });
    
    expect(mockRefresh).toHaveBeenCalledTimes(refreshTestParams.sites.length);
  });
  
  it('can handle error from server', async () => {
    setupRefreshServer();
    server.use(
      rest.get('/sites/:app', (req, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    render(<Dashboard/>);
    const refreshButtons = await(screen.findAllByText('Refresh'));
    refreshButtons[0].click();
    await screen.findByRole('alert');

    const details = document.getElementsByClassName('large')[0];
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent))
      .toBe(true);

    await waitForElementToBeRemoved(
      () => screen.queryByRole('alert'),
      {timeout: config.DASHBOARD_ERROR_TIMEOUT});    
  });

  it('can handle internal error from fetch', async () => {
    setupRefreshServer();
    render(<Dashboard/>);
    const refreshButtons = await(screen.findAllByText('Refresh'));

    server.close();
    refreshButtons[0].click();
    await screen.findByRole('alert');
    server.listen();

    const details = document.getElementsByClassName('large')[0];
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent))
      .toBe(true);
    
    await waitForElementToBeRemoved(
      () => screen.queryByRole('alert'),
      {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle internal error when parsing response', async () => {
    setupRefreshServer();
    server.use(
      rest.get('/sites/:app', (req, res, ctx) => {
        return res(ctx.json(null));
      }),
    );
    
    render(<Dashboard/>);
    const refreshButtons = await(screen.findAllByText('Refresh'));
    refreshButtons[0].click();
    await screen.findByRole('alert');

    const details = document.getElementsByClassName('large')[0];
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent))
      .toBe(true);    

    await waitForElementToBeRemoved(
      () => screen.queryByRole('alert'),
      {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });

  it('can handle malformed response', async () => {
    setupRefreshServer();
    server.use(
      rest.get('/sites/:app', (req, res, ctx) => {
        return res(ctx.json({
          isDown: true,
          lastStatusChange: undefined,
          lastStatusUpdate: new Date().toString(),
          nextAutomatedUpdate: new Date().toString(),
        }));
      }),
    );

    render(<Dashboard/>);
    const refreshButtons = await(screen.findAllByText('Refresh'));
    refreshButtons[0].click();
    await screen.findByRole('alert');

    const details = document.getElementsByClassName('large')[0];
    expect(/Last Status Update:\s?1 hour ago/.test(details.textContent))
      .toBe(true);    

    await waitForElementToBeRemoved(
      () => screen.queryByRole('alert'),
      {timeout: config.DASHBOARD_ERROR_TIMEOUT});
  });
});
