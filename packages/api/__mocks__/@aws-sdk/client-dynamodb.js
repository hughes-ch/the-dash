/**
 *   Mock of the @aws-sdk/client-dynamodb module
 *
 *   :copyright: Copyright (c) 2021 Chris Hughes
 *   :license: MIT License
 */
jest.createMockFromModule('@aws-sdk/client-dynamodb');

// Global storage object. Serves as local database
let globalStorage = { }

/**
 * Create a DynamoDB client
 *
 * @param {Object}  config  Client config
 * @return {Object}
 */
exports.DynamoDBClient = function(config) {
  this.config = config;
  this._lostConnection = false;
  
  this.send = async function(command) {
    if (this._lostConnection) {
      throw new Error('Could not connect to AWS');
    }
    return command.send();
  }

  this.mockReset = function() {
    globalStorage = { };
  }
}

/**
 * Checks that the command has a valid table specified
 *
 * Table does not need to exist
 *
 * @param {Object} command
 * @return {undefined}
 */
function checkThatTableSpecified(command) {
  if (!command.TableName) {
    throw new Error(
      `Malformed command. Must include a TableName`
    );
  }
}

/**
 * Checks for the existance of the table the command will execute on
 *
 * @param {Object}  command
 * @return {undefined}
 */
function checkThatTableExists(command) {
  if (!globalStorage[command.TableName]) {
    throw new Error(
      `Could not perform ${command.name} on ${command.TableName}.` +
        `Table does not exist`
    );
  }
}

const commands = {
  /**
   * Minimal implementation of the CreateTableCommand
   */
  CreateTableCommand: {
    // Always validates
    validate(command) { },

    // Creates the table in global storage
    makeSend(command) {
      return () => {
        if (globalStorage[command.TableName]) {
          throw new Error(
            `Could not create table. ${command.TableName} already exists`
          );
        }
        globalStorage[command.TableName] = [];
      };
    },
  },

  /**
   * Minimal implementation of the GetItemCommand
   */
  GetItemCommand: {
    // Command must have a Key and TableName
    validate(command) {
      checkThatTableSpecified(command);
      if (!command.Key) {
        throw new Error(
          `Malformed command. Must include a Key`
        );
      }
    },

    // Makes a command to get a single item from the table
    makeSend(command) {
      return () => {
        checkThatTableExists(command);
        const keyName = Object.keys(command.Key)[0];
        const keyType = Object.keys(command.Key[keyName])[0];
        const keyValue = command.Key[keyName][keyType];
        const foundValue = globalStorage[command.TableName].find(e => {
          return e[keyName][keyType] === keyValue;
        });

        return {
          Item: foundValue,
        };
      };
    }
  },

  /**
   * Minimal implementation of the PutItemCommand
   */
  PutItemCommand: {
    // Always validates
    validate(command) { },

    // Adds the item to the table
    makeSend(command) {
      return () => {
        checkThatTableExists(command);
        globalStorage[command.TableName].push(command.Item);
      };
    },
  },

  /**
   * The ScanCommand
   */
  ScanCommand: {
    // Command must include a TableName
    validate(command) {
      checkThatTableSpecified(command);
    },

    // Simplistic implementation - returns all items in TableName
    makeSend(command) {
      return () => {
        checkThatTableExists(command);
        return {
          Items: globalStorage[command.TableName]
        };
      };
    },
  }
};

for (const [name, funcs] of Object.entries(commands)) {
  exports[name] = function(command) {
    funcs.validate(command);

    const inputCommand = {...command};
    inputCommand.name = name;
    this.send = funcs.makeSend(inputCommand);
  }
}
