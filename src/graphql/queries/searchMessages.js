import gql from 'graphql-tag'

export default gql`
  query search($msgFilter: SearchableMessageFilterInput!) {
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
