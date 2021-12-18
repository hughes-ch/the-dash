<h1 align="center">
    <img width="100" height="100" src="packages/ui/public/logo192.png" alt=""><br>
    THE DASH
</h1>
A simple dashboard used to monitor the status of web applications, written with React and Node. It's hosted primarily on Netlify, leveraging its Function feature and keeping the application completely serverless. Two additional AWS Lamdba functions run periodically, pinging each website listed on the dashboard and notifying users of the application if one of the websites are down. The status of each website is maintained in a AWS DynamoDB instance. 

## Using THE DASH
THE DASH can be found [here](https://the-dash.chrishughesdev.com/). 

Logins are managed through AWS Cognito. New users must be added by the administrator. 

Once logged in, users will be displayed the general status, a detailed overview, and details of each site. Clicking on each site card will bring you to the website. Clicking the refresh button of each website will update the status. Selecting the "Refresh All" button at the bottom of the page will refresh each site. 

Selecting the "Add new URL" button at the bottom of the page allows users to monitor a new website. Selecting the X at the top left of each card will remove the selected website. 

See below for an example of the dashboard:

<img width="400" height="400" src="logo.svg" alt=""><br>

## Contributing to THE DASH
@hughes-ch expects to be the only contributer to this project, but this section is being added because he's forgetful.

### Architecture
This project is managed as a monorepo with four small packages:

`@the-dash/`
- `api`: Netlify functions managing DynamoDB access and authentication
- `aws`: Periodic AWS Lambda functions that notify the user when a website goes down
- `common`: Functionality that is shared between the `api`, `aws`, and `ui` packages
- `ui`: The create-react-app frontend

Details about each package are in the following sections.

#### The UI Package
The UI package is the first thing the user interacts with when they interact with the app. It's built with create-react-app. 

All source and tests can be found in `/src`. Static assets can be found in `/public`. 

The `index.jsx` file in `/src` is the entry point to the app, with `app.jsx` acting as the top-level component. There are two screens: the `SplashScreen` and the `Dashboard`. The only action that can be taken on the `SplashScreen` is to click the `LoginButton`, which routes the user to the `Dashboard`. 

The `Dashboard` is hidden behind an `Authenticator` which verifies that the client is logged in before showing the contents. If the client is logged out, the `Authenticator` routes the client to the AWS Cognito hosted UI. Cognito then routes the client back to the `Dashboard` with the URL hash set with the JWT serving as credentials. The JWT is saved as a cookie until the user logs out. 

Most of the action takes place in the `Dashboard`. Here's what the user can do:
- Click the "Add New URL" button: sends a PUT request to `/site/:app` (`:app` being the new website)
- Click the "Refresh" button: sends a GET request to `/site/:app`
- Click the "Refresh All" button: sends a GET request to `/site/:app` for each app
- Click the "X" at the top left of the website card: sends a DELETE request to `/site/:app`

#### The API Package
The API package is what handles each of these requests as Netlify Functions. In addition to the ones listed above, there's also the GET `/sites` API, which provides a list of all the sites in the database and their current status (unlike the endpoints above, this command does not actively ping the sites).

The Netlify configuration file (`netlify.toml`) is stored at the top-level of the repo and hints at the structure of these functions. They are stored in `/api/functions` and associated with their given URL. For example the `/sites` function is in `/api/function/sites/index.js`. The functions themselves are pretty simple. All they do is check for the HTTP method and delegate to a function in `/api/lib`. Each HTTP method has its own function handler. 

Authentication is handled by the `authenticatedFunction` wrapper, which is exported to Netlify as the entrypoint into each Function. 

DynamoDB interactions are handled with the `dynamodb` module. Note that this functionality is mocked when running Jest within `/api/__mocks__/`. 

#### The AWS Package
While the application is essentially complete with just the UI and API packages, the AWS package allows the user to be notified when a website goes down. The functions defined here run periodically using the AWS Lambda service. There are two:
- `email-service.js`: Notifies the user of down websites through AWS SES. Interacts with API package instead of DynamoDB.
- `heroku-ping.js`: Scheduled immediately before `email-service` to [wakeup Heroku apps running on free tier](https://devcenter.heroku.com/articles/free-dyno-hours#dyno-sleeping).

Lamdbas are deployed via the "Deploy AWS Lambda" Github action. They are first webpacked into the `/aws/dist` directory. Then the output is copied into a Docker image and deployed to AWS ECR. The code which manages the deploy is in `/aws/scripts`. Github actions are defined in the top level of the repo in `/.github`.

### Setting up environment
THE DASH uses the yarn package manager to handle dependencies. Yarn 3 notes that you shouldn't need to install before using a repo, but just to be sure, you can run:

`yarn install` 

to install all dependencies. 

The next thing to do is to define a `.env` file in `/packages/aws/`. This file is used to AWS credentials, specifically:
- MY_AWS_ACCESS_KEY
- MY_AWS_REGION
- MY_AWS_SECRET_ACCESS_KEY
- AWS_COGNITO_USER
- AWS_COGNITO_PASS

Don't commit these variables.

The last thing to note is that `app-config.js` in the `common` package is used to define constants used throughout the application. Some of these change based on the deployment environment. You can change the deployment environment with the `REACT_APP_DEPLOY_ENVIRONMENT` environment variable. This should be handled for you, but just something to keep in mind. 

### Testing
To host UI and API locally: 

`yarn host`

To run **all** unit tests: 

`yarn test`

To run **some** unit tests: 

`yarn workspace @the-dash/<package> test` 

`<package>` can be `api`, `common`, etc

To run AWS service locally: 

`aws-build && aws-start`
