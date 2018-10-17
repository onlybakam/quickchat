import gql from 'graphql-tag'

export default gql`
  subscription onCreateMessage($messageConversationId: ID!) {
    onCreateMessage(messageConversationId: $messageConversationId) {
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
`
