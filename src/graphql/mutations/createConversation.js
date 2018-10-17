import gql from 'graphql-tag'

export default gql`
  mutation createConvo($name: String!) {
    createConvo(input: { name: $name }) {
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
`
