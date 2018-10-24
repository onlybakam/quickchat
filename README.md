# A Quich Chat App

## Set up

Use amplify-cli from this [github.com/onlybakam/amplify-cli](https://github.com/onlybakam/amplify-cli)

### 0. root dir

```bash
mkdir CHAT
cd CHAT
```

### 1. Install CLI

```bash
git clone https://github.com/onlybakam/amplify-cli.git
cd amplify-cli
npm install
npm run setup-dev
cd ...
```

### 2. Clone quickchat

```bash
git clone https://github.com/onlybakam/quickchat.git
cd quickchat
npm install
```

### 3. Setup amplify

```bash
amplify init # use the defaults, set up your profile if necessary
amplify auth add # use defaults
amplify storage add # Read/Write for Auth users only
amplify api add # GraphQL > chatqlreactapp > Amazon Cognito User Pool
  # Use the provided schema and custom resolvers under `/amplify/backend/api/chatqlreactapp`
amplify push
```

### 4. Run server
```bash
npm run start
```

- Enjoy!

