import gql from 'graphql-tag'

export default gql`
  query getConvoMessages($convoId: ID!, $nextToken: String) {
    getConvoMessages(
      convoId: $convoId
      limit: 20
      sortDirection: DESC
      nextToken: $nextToken
    ) {
      nextToken
      items {
        id
        content
        createdAt
        owner
        isSent
        messageConversationId
        file {
          bucket
          region
          key
        }
      }
    }
  }
`
