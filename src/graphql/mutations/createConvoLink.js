import gql from 'graphql-tag'

export default gql`
  mutation createConvoLink($userId: ID!, $convoId: ID!, $name: String!) {
    createConvoLink(
      input: {
        convoLinkUserId: $userId
        convoLinkConversationId: $convoId
        name: $name
        status: "CREATING"
      }
    ) {
      id
      name
      status
      conversation {
        id
        name
        createdAt
        associated {
          items {
            convoLinkUserId
            user {
              id
              username
            }
          }
        }
      }
    }
  }
`
