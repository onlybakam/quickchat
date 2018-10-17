import gql from 'graphql-tag'

export default gql`
  query search($userTerm: String!) {
    searchUsers(filter: { username: { regexp: $userTerm } }) {
      nextToken
      items {
        id
        username
      }
    }
  }
`
