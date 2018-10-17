import gql from 'graphql-tag'

export default gql`
  mutation updateConvoLink($id: ID!) {
    updateConvoLink(input: { id: $id, status: "READY" }) {
      id
      name
      convoLinkUserId
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
