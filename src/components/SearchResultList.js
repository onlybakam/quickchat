import React from 'react'
import PropTypes from 'prop-types'
import search from '../graphql/queries/search'
import { graphql } from 'react-apollo'
import BarLoader from 'react-spinners/BarLoader'
import moment from 'moment'

function formatDate(date) {
  return moment(date).calendar(null, {
    sameDay: 'LT',
    lastDay: 'MMM D LT',
    lastWeek: 'MMM D LT',
    sameElse: 'l'
  })
}

const SearchResultList = ({
  getMenuProps,
  getItemProps,
  selectedItem,
  data = {},
  conversations = { items: [] }
}) => {
  const { loading = false } = data
  const convoMap = conversations.items.reduce((acc, cur) => {
    acc[cur.conversation.id] = cur.name
    return acc
  }, {})
  return (
    <div {...getMenuProps()} className="section sidelist">
      <div className="user.ist d-flex flex-column">
        {loading ? (
          <DataLoading />
        ) : (
          <ResultLists {...{ data, getItemProps, selectedItem, convoMap }} />
        )}
      </div>
    </div>
  )
}
SearchResultList.propTypes = {
  getMenuProps: PropTypes.func.isRequired,
  getItemProps: PropTypes.func.isRequired,
  conversations: PropTypes.object,
  selectedItem: PropTypes.object,
  term: PropTypes.string,
  data: PropTypes.object
}

const DataLoading = () => (
  <div className="p-4 text-muted h5 text-center">
    <BarLoader
      {...{
        color: '#527fff',
        height: 10,
        heightUnit: 'px',
        loading: true,
        width: 100,
        widthUnit: '%'
      }}
    />
  </div>
)

const ResultLists = ({ data = {}, getItemProps, selectedItem, convoMap }) => {
  // const users = _get(data, 'searchUsers.items', [])
  const {
    searchUsers: { items: users = [] } = {},
    searchMessages: { items: messages = [] } = {}
  } = data

  const totalLength = users.length + messages.length
  return (
    <React.Fragment>
      {totalLength ? (
        <React.Fragment>
          <UserList {...{ users, offset: 0, getItemProps, selectedItem }} />
          <MessageList
            {...{
              messages,
              offset: users.length,
              getItemProps,
              selectedItem,
              convoMap
            }}
          />
        </React.Fragment>
      ) : (
        <div className="p-4 text-muted h5 text-center">Nothing found</div>
      )}
    </React.Fragment>
  )
}
ResultLists.propTypes = {
  getItemProps: PropTypes.func.isRequired,
  data: PropTypes.object,
  selectedItem: PropTypes.object,
  convoMap: PropTypes.object.isRequired
}

const UserList = ({ users, offset, getItemProps, selectedItem }) => {
  const selItemId = selectedItem ? selectedItem.id : null
  return (
    <React.Fragment>
      <div className="list-group list-group-flush">
        <div className="list-group-item">
          <h3>Users</h3>
        </div>
        {!users.length && (
          <div className="list-group-item text-muted h5 text-center">
            Nothing found
          </div>
        )}
        {users.map((user, index) => (
          <button
            type="button"
            {...getItemProps({
              key: 'user-' + user.id,
              index: offset + index,
              item: user
            })}
            className={
              'list-group-item list-group-item-action' +
              (selItemId === user.id ? ' active' : '')
            }
          >
            {user.username}
          </button>
        ))}
      </div>
    </React.Fragment>
  )
}
UserList.propTypes = {
  getItemProps: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
  selectedItem: PropTypes.object,
  offset: PropTypes.number.isRequired
}

const MessageList = ({
  messages,
  offset,
  getItemProps,
  selectedItem,
  convoMap
}) => {
  const selItemId = selectedItem ? selectedItem.id : null
  return (
    <React.Fragment>
      <div className="list-group list-group-flush">
        <div className="list-group-item">
          <h3>Messages</h3>
        </div>
        {!messages.length && (
          <div className="list-group-item text-muted h5 text-center">
            Nothing found
          </div>
        )}
        {messages.map((msg, index) => (
          <button
            type="button"
            {...getItemProps({
              key: 'msg-' + msg.id,
              index: offset + index,
              item: msg
            })}
            className={
              'list-group-item list-group-item-action' +
              (selItemId === msg.id ? ' active' : '')
            }
          >
            <div className="d-flex flex-row justify-content-between">
              <div>{convoMap[msg.messageConversationId] || '???'}</div>
              <div className="small">{formatDate(msg.createdAt)}</div>
            </div>
            <div className="small text-truncate">{msg.content}</div>
          </button>
        ))}
      </div>
    </React.Fragment>
  )
}
MessageList.propTypes = {
  getItemProps: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  offset: PropTypes.number.isRequired,
  selectedItem: PropTypes.object,
  convoMap: PropTypes.object.isRequired
}

function buildMsgFilter(term, conversations = {}) {
  const items = conversations.items || []
  const convoIds = items.map(i => i.conversation.id)
  const filter = convoIds.length
    ? {
        content: { regexp: `.*${term}.*` },
        and: [
          {
            or: convoIds.map(id => ({ messageConversationId: { eq: id } }))
          }
        ]
      }
    : {
        id: { eq: '-1' }
      }
  console.log('msg filter', filter)
  return filter
}

const SearchResultListWithData = graphql(search, {
  skip: props => !props.term,
  options: props => ({
    variables: {
      userTerm: `.*${props.term}.*`,
      msgFilter: buildMsgFilter(props.term, props.conversations)
    },
    fetchPolicy: 'cache-and-network'
  })
})(SearchResultList)

export default SearchResultList
export { SearchResultListWithData }
