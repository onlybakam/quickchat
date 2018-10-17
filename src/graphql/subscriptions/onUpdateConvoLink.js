import gql from 'graphql-tag'

export default gql`
  subscription onUpdateConvoLink($convoLinkUserId: ID!) {
    onUpdateConvoLink(convoLinkUserId: $convoLinkUserId) {
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
