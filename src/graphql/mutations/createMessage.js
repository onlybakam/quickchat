import gql from 'graphql-tag'

export default gql`
  mutation createMessage(
    $id: ID!
    $content: String!
    $messageConversationId: ID!
    $file: S3ObjectInput
  ) {
    createMessage(
      input: {
        id: $id
        content: $content
        messageConversationId: $messageConversationId
        file: $file
      }
    ) {
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
