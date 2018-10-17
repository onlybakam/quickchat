# Amplify React

## Set up

Use amplify-cli from this [repo](https://github.com/onlybakam/amplify-cli)

- `yarn install`
- `amplify init` : use defaults
- `amplify auth add` : use defaults
- `amplify storage add` : r/w for Auth users only
- `amplify api add`: GraphQL, chatqlreactapp, Amazon Cognito User Pool, Use the provided schema and custom resolvers under `/amplify/backend/api/chatqlreactapp`
- `amplify push`
- `yarn serve`
- Enjoy!
