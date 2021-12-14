/**
 *   Defines extended matchers for website-handlers
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
const { addDynamoTypeInfo,
        createDynamoClient,
        getAllEntriesInDb,
        setupAwsTestEnv } = require('./dynamodb');
const config = require('@the-dash/common/app-config');
const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { rest } = require('msw');
const { setupServer } = require('msw/node');

/**
 * ENV and constants
 */
let dynamoClient = createDynamoClient();
const goodWebsite = {
  name: 'good.website.com',
  isDown: false,
  lastStatusChange: '2020-04-04 10:49:00 EST',
  lastStatusUpdate: '2020-04-04 10:49:00 EST',
  nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
};
const downWebsite = {
  name: 'down.website.com',
  isDown: false,
  lastStatusChange: '2020-04-04 10:49:00 EST',
  lastStatusUpdate: '2020-04-04 10:49:00 EST',
  nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
};
const timedOutWebsite = {
  name: 'timeout.website.com',
  isDown: true,
  lastStatusChange: '2020-04-04 10:49:00 EST',
  lastStatusUpdate: '2020-04-04 10:49:00 EST',
  nextAutomatedUpdate: '2020-04-04 10:49:00 EST',
};

let longRunningPromises = [];
const server = setupServer(
  rest.get(`https://${goodWebsite.name}`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
  rest.get(`https://${downWebsite.name}`, (req, res, ctx) => {
    return res(ctx.status(404));
  }),
  rest.get(`https://${timedOutWebsite.name}`, async (req, res, ctx) => {
    const timeout = config.LONG_RUNNING_FETCH_TIMEOUT * 1.5;
    async function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const thisPromise = sleep(timeout);
    longRunningPromises.push(thisPromise);
    await thisPromise;

    return res(ctx.status(200));
  }),
);

/**
 * Define helper functions
 */
async function prepareDatabase() {
  await setupAwsTestEnv(dynamoClient);

  const tableName = process.env.AWS_SITE_TABLE;
  const createGoodWebsite = new PutItemCommand({
    TableName: tableName,
    Item: addDynamoTypeInfo(goodWebsite),
  });
  const createDownWebsite = new PutItemCommand({
    TableName: tableName,
    Item: addDynamoTypeInfo(downWebsite),
  });
  await dynamoClient.send(createGoodWebsite);
  return dynamoClient.send(createDownWebsite);
}

async function prepareTestEnvFor(testFunc) {
  server.listen();
  await prepareDatabase();
  const returnVal = await testFunc();
  dynamoClient.mockReset();
  server.close();
  await Promise.all(longRunningPromises);
  return returnVal;
}

async function testFor500DuringEvents(received, events) {
  const results = [];
  for (const path of events) {
    const event = { path: path };
    results.push(received(event));
  }
  const resolved = await Promise.all(results);
  const non500Status = resolved.find(e => e.statusCode !== 500);
  if (non500Status) {
    return {
      message: () => `Expected status to be 500. Got ${non500Status}`,
      pass: false,
    };
  } else {
    return {
      message: () => `Expected status to be !== 500`,
      pass: true,
    };
  }
}

async function performDbComparison(event, received, comparison) {
  return prepareTestEnvFor(async() => {
    const priorEntries = (await getAllEntriesInDb()).length;
    await received(event);
    const entriesAfter = (await getAllEntriesInDb()).length;
    return {
      message: () => `Entries after: ${entriesAfter} before: ${priorEntries}`,
      pass: comparison(entriesAfter, priorEntries),
    };
  });
}

/**
 * Define extended matchers
 */
expect.extend({
  /** 
   * Checks that only DNS-valid names are accepted
   */
  async toHandleDangerousPathNames(received) {
    const events = ['/site/name@().html'];
    return prepareTestEnvFor(async () => {
      return testFor500DuringEvents(received, events);
    });
  },

  /**
   * Checks that empty app names result in 500 status
   */
  async toHandleEmptyAppName(received) {
    const events = ['/site/', '/site'];
    return prepareTestEnvFor(async () => {
      return testFor500DuringEvents(received, events);
    });
  },

  /**
   * Checks that status 500 is returned when internal error encountered
   */
  async toHandleInternalErrors(received) {
    const events = [`/site/${goodWebsite.name}`];
    return prepareTestEnvFor(async () => {
      dynamoClient.mockReset();
      return testFor500DuringEvents(received, events);
    });
  },

  /**
   * Check that timed-out websites are marked down
   */
  async toHandleWebsiteTimeouts(received) {
    const event = { path: `/site/${timedOutWebsite.name}` };
    const response = await prepareTestEnvFor(async () => {
      const putItemCommand = new PutItemCommand({
        TableName: process.env.AWS_SITE_TABLE,
        Item: addDynamoTypeInfo(timedOutWebsite),
      });
      await dynamoClient.send(putItemCommand);
      return received(event);
    });
    if (response.statusCode !== 200) {
      return {
        message: () => `Expected status code of 200. Got ${response.statusCode}`,
        pass: false,
      };
    }

    const json = JSON.parse(response.body);
    return {
      message: () => `Expected isDown to be ${!json.isDown}. Got ${json.isDown}`,
      pass: json.isDown,
    };
  },

  /**
   * Check that new websites are added
   */
  async toCreateNewWebsites(received) {
    const event = { path: `/site/${timedOutWebsite.name}` };
    return performDbComparison(event, received, (a, b) => a > b);
  },

  /**
   * Check that good websites are detected
   */
  async toDetectWorkingWebsites(received) {
    event = { path: `/site/${goodWebsite.name}` };
    return prepareTestEnvFor(async() => {
      const response = await received(event);
      if (response.statusCode !== 200) {
        return {
          message: () => `Expected status 200. Got ${response.statusCode}`,
          pass: false,
        };
      }

      const json = JSON.parse(response.body);
      if (json.name !== goodWebsite.name) {
        return {
          message: () =>
            `Expected name to be ${goodWebsite.name}. Got ${json.name}`,
          pass: false,
        };
      }
      
      if (json.isDown) {
        return {
          message: () => `Expected not to be down`,
          pass: false,
        };
      }

      const timeSinceChange = new Date() - new Date(json.lastStatusChange);
      if (timeSinceChange <= 1000) {
        return {
          message: () => 'Expected timeSinceChange to have stayed the same',
          pass: false,
        };
      }

      const timeSinceUpdate = new Date() - new Date(json.lastStatusUpdate);
      if (timeSinceUpdate >= 1000) {
        return {
          message: () => 'Expected timeSinceUpdate to have changed',
          pass: false,
        };
      }

      const timeSinceAutoUpdate = new Date() - new Date(json.nextAutomatedUpdate);
      if (timeSinceAutoUpdate >= 1000) {
        return {
          message: () => 'Expected timeSinceAutoUpdate to have changed',
          pass: false,
        };
      }

      return {
        message: () => '',
        pass: true,
      };
    });
  },

  /**
   * Check that bad websites are detected
   */
  async toDetectDownWebsites(received) {
    const event = { path: `/site/${downWebsite.name}` };
    return prepareTestEnvFor(async() => {
      const response = await received(event);
      if (response.statusCode != 200) {
        return {
          message: () => `Expected status 200. Got ${response.statusCode}`,
          pass: false,
        };
      }

      const json = JSON.parse(response.body);
      if (!json.isDown) {
        return {
          message: () => `Expected to be down`,
          pass: false,
        };
      }
      
      const timeSinceChange = new Date() - new Date(json.lastStatusChange);
      if (timeSinceChange >= 1000) {
        return {
          message: () => `Expected timesincechange to have stayed the same`,
          pass: false,
        };
      }

      return {
        message: () => '',
        pass: true,
      };
    });
  },

  /**
   * Check non-existant websites return 404
   */
  async toReturn404WhenNotFound(received) {
    const event = { path: '/site/not.an.app' };
    return prepareTestEnvFor(async () => {
      const code = (await received(event)).statusCode;
      const expected = code === 404 ? '!==' : '===';
      return {
        message: () => `Expected response ${expected} 404. Got ${code}`,
        pass: code === 404,
      };
    }); 
  },

  /**
   * Checks websites are deleted
   */
  async toDeleteWebsites(received) {
    const event = { path: `/site/${downWebsite.name}` };
    return performDbComparison(event, received, (a, b) => a < b);
  },
});

it('has a test', () => {
  expect(true).toBe(true);
}); 
