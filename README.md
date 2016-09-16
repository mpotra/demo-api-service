# demo-api-service
A RESTful API gateway demo

# How to install and run

### Step 1. Download the sources
```
git clone git@github.com:mpotra/demo-api-service.git
cd demo-api-service
```

### Step 2. Install dependencies
```
npm install
```

### Step 3. Building
```
npm run build
```
### Step 4. (Optional) Configure

Either provide environment variables (see [.config.example.json](.config.example.json) for a list), or
```
cp .config.example.json .config.json
```
and edit `.config.json`

#### Setting up a Nexmo account

In order to make use of the [Nexmo](http://www.nexmo.com) API, an Api KEY and an API secret are required.

For obtaining an application Id (optional):
```
npm install nexmo-cli
nexmo app:create demo1 http://demo.example.com/nexmo/proxy-call http://demo.example.com/nexmo/event
```

### Step 5. Run
```
node index
```
or
```
node index | bunyan
```

## Available tools and commands
`npm run clean` - clean the build directory [lib/](/lib)

`npm run jslint` - validate the source code in [src/](/src)

`npm run jslint:test` - validate the source code in [test/](/test) (*missing*)

`npm run test` - run tests in [test/](/test) (*missing*)

`npm run test-cov` - run coverage (*missing*)

# API Routes

## Getting the current user
```
GET /me HTTP/1.1
Authorization: Bearer 123456789
```
Note: `Authorization` (Bearer) is required. (Current available test token: `123456789`)

## Getting user by telephone number
```
GET /users/PHONE_NUMBER HTTP/1.1
Authorization: Bearer 123456789
```
Note: `Authorization` (Bearer) is required. (Current available test token: `123456789`)
Example: `GET /users/+40000000`

## Creating a new user (and receiving a SMS with a validation code)
```
POST /users HTTP/1.1
Content-Type: application/x-www-form-urlencoded

telephone=40111222333&firstName=Mike
```

Fields:
- telephone (mandatory) - *String (e.g. '40111222333')*
- firstName (mandatory) - *String (e.g. 'Mike')*
- lastName (optional) - *String (e.g. 'Doe')*
- email (optional) - *String (e.g. 'john@doe.com')*

Note: `Authorization` is not required for this operation.