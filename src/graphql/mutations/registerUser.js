import gql from 'graphql-tag'

export default gql`
  mutation register {
    registerUser {
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
