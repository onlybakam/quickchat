import gql from 'graphql-tag'

export default gql`
  query getMe($id: ID!) {
    getUser(id: $id) {
      id
      username
      registered
      userConversations {
        items {
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
    }
  }
`
