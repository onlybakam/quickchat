import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ConversationBar from './ConversationBar'
import { InputBarWithData } from './InputBar'
import MessagePane from './MessagePane'
import getConvoMessages from '../graphql/queries/getConvoMessages'
import { graphql } from 'react-apollo'
// import _get from 'lodash.get'

class Messenger extends Component {
  render() {
    const {
      switchView,
      conversation,
      conversationName,
      data: {
        subscribeToMore,
        fetchMore,
        getConvoMessages: { items: messages = [], nextToken } = {}
      } = {}
    } = this.props
    return (
      <React.Fragment>
        <ConversationBar
          {...{ conversation, name: conversationName, switchView }}
        />
        <MessagePane
          conversation={this.props.conversation}
          userId={this.props.userId}
          userMap={this.getUserMap()}
          {...{ messages, subscribeToMore, fetchMore, nextToken }}
        />
        <InputBarWithData
          conversation={this.props.conversation}
          userId={this.props.userId}
        />
      </React.Fragment>
    )
  }

  getUserMap = () => {
    const {
      conversation: { associated: { items = [] } = {} } = {}
    } = this.props
    return items.reduce((acc, curr) => {
      acc[curr.user.id] = curr.user.username
      return acc
    }, {})
  }
}

Messenger.propTypes = {
  conversation: PropTypes.object,
  conversationName: PropTypes.string,
  userId: PropTypes.string,
  switchView: PropTypes.func.isRequired,
  data: PropTypes.object
}

const MessengerWithData = graphql(getConvoMessages, {
  skip: props => !props.conversation,
  options: props => ({
    variables: { convoId: props.conversation ? props.conversation.id : '-1' },
    fetchPolicy: 'cache-and-network'
  })
})(Messenger)

export default Messenger
export { MessengerWithData }
