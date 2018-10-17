import gql from 'graphql-tag'

export default gql`
  query search($userTerm: String!, $msgFilter: SearchableMessageFilterInput!) {
    searchUsers(filter: { username: { regexp: $userTerm } }) {
      nextToken
      items {
        id
        username
      }
    }
    searchMessages(filter: $msgFilter) {
      items {
        id
        content
        createdAt
        owner
        messageConversationId
      }
    }
  }
`
