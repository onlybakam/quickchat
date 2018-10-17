import React from 'react'
import PropTypes from 'prop-types'
import { Scrollbars } from 'react-custom-scrollbars'
import onCreateMessage from '../graphql/subscriptions/onCreateMessage'
import moment from 'moment'
import { Storage, Cache } from 'aws-amplify'
import { Subject, of, from } from 'rxjs'
import { pairwise, filter, exhaustMap } from 'rxjs/operators'

Storage.configure({ level: 'protected' })

function formatDate(date) {
  return moment(date).calendar(null, {
    sameDay: 'LT',
    lastDay: 'MMM D LT',
    lastWeek: 'MMM D LT',
    sameElse: 'l'
  })
}

const SCROLL_THRESHOLD = 0.25

export default class MessagePane extends React.Component {
  scrollbarsRef = React.createRef()
  subject = new Subject()
  obs = this.subject.asObservable()

  componentDidMount() {
    console.log('MessagePane - componentDidMount')
    if (this.props.conversation) {
      console.log('MessagePane - componentDidMount - subscribe')
      this.unsubscribe = this.createSubForConvoMsgs()
    }
    this.obs
      .pipe(
        pairwise(),
        filter(this.isScrollingUpPastThreshold),
        exhaustMap(this.loadMoreMessages)
      )
      .subscribe(_ => {})
  }

  componentDidUpdate(prevProps, prevState) {
    const currConvo = this.props.conversation || {}
    const prevConvo = prevProps.conversation || {}
    if (currConvo && prevConvo.id !== currConvo.id) {
      if (this.unsubscribe) {
        console.log('MessagePane - componentDidUpdate - unsubscribe')
        this.unsubscribe()
      }
      console.log('MessagePane - componentDidUpdate - subscribe')
      this.unsubscribe = this.createSubForConvoMsgs()
    }
    // if (currConvo) { }
    const prevMsgs = prevProps.messages || []
    const messages = this.props.messages || []
    if (prevMsgs.length !== messages.length) {
      const p0 = prevMsgs[0]
      const m0 = messages[0]
      if ((p0 && m0 && p0.id !== m0.id) || (!p0 && m0)) {
        this.scrollbarsRef.current.scrollToBottom()
      }
    }
  }

  componentWillUnmount() {
    console.log('MessagePane - componentWillUnmount')
    if (this.unsubscribe) {
      console.log('MessagePane - componentDidUpdate - unsubscribe')
      this.unsubscribe()
    }
  }

  isScrollingUpPastThreshold = ([prev, curr]) => {
    // console.log('isScrolling', prev, curr)
    const result = (prev.top > curr.top) & (curr.top < SCROLL_THRESHOLD)
    if (result) {
      console.log('Should fetch more messages')
    }
    return result
  }

  loadMoreMessages = () => {
    const { fetchMore, nextToken } = this.props
    if (!nextToken) {
      return of(true)
    }
    const result = fetchMore({
      variables: { nextToken: nextToken },
      updateQuery: (prev, { fetchMoreResult: data }) => {
        return {
          getConvoMessages: {
            __typename: 'ModelMessageConnection',
            nextToken: data.getConvoMessages.nextToken,
            items: [
              ...prev.getConvoMessages.items,
              ...data.getConvoMessages.items
            ]
          }
        }
      }
    })
    return from(result)
  }

  createSubForConvoMsgs = () => {
    const {
      subscribeToMore,
      conversation: { id: convoId },
      userId
    } = this.props
    return subscribeToMore({
      document: onCreateMessage,
      variables: { messageConversationId: convoId },
      updateQuery: (
        prev,
        {
          subscriptionData: {
            data: { onCreateMessage: newMsg }
          }
        }
      ) => {
        console.log('updateQuery on message subscription', prev, newMsg)
        if (newMsg.owner === userId) {
          console.log('skipping own message')
          return
        }
        const current = {
          getConvoMessages: {
            __typename: 'ModelMessageConnection',
            nextToken: prev.getConvoMessages.nextToken,
            items: [newMsg, ...prev.getConvoMessages.items]
          }
        }
        return current
      }
    })
  }

  render() {
    const { messages, conversation, userMap, userId } = this.props
    return (
      <div className="pane bg-ligthergray">
        {conversation ? (
          <Scrollbars
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            onScrollFrame={values => this.subject.next(values)}
            // onUpdate={x => console.log('on update', x)}
            ref={this.scrollbarsRef}
          >
            <div className="messageList d-flex flex-column">
              {[...messages].reverse().map((msg, idx, arr) => (
                <Message
                  msg={msg}
                  username={userMap[msg.owner]}
                  ownsPrev={idx > 0 && arr[idx - 1].owner === msg.owner}
                  isUser={msg.owner === userId}
                  key={msg.id}
                />
              ))}
            </div>
          </Scrollbars>
        ) : null}
      </div>
    )
  }
}
MessagePane.propTypes = {
  conversation: PropTypes.object,
  userId: PropTypes.string,
  messages: PropTypes.array.isRequired,
  userMap: PropTypes.object.isRequired,
  subscribeToMore: PropTypes.func,
  fetchMore: PropTypes.func,
  nextToken: PropTypes.string
}

class Message extends React.Component {
  state = { fileUrl: undefined }
  componentDidMount() {
    this.checkFileUrl()
  }

  componentDidUpdate(prevProps, prevState) {
    const { msg: prevMsg } = prevProps
    const { msg: currMsg } = this.props
    if (
      prevMsg.file &&
      prevMsg.file.key === null &&
      currMsg.file &&
      currMsg.file.key
    ) {
      this.checkFileUrl()
    }
  }

  checkFileUrl() {
    const { file } = this.props.msg
    if (file && file.key) {
      const fileUrl = Cache.getItem(file.key)
      if (fileUrl) {
        console.log(`Retrieved cache url for ${file.key}: ${fileUrl}`)
        return this.setState({ fileUrl })
      }

      const [, identityIdWithSlash, keyWithoutPrefix] =
        /([^/]+\/){2}(.*)$/.exec(file.key) || file.key
      const identityId = identityIdWithSlash.replace(/\//g, '')
      console.log(
        `Retrieved new key for ${file.key}: ${identityId} - ${keyWithoutPrefix}`
      )
      Storage.get(keyWithoutPrefix, { identityId }).then(fileUrl => {
        console.log(`New url for ${file.key}: ${fileUrl}`)
        const expires = moment()
          .add(14, 'm')
          .toDate()
          .getTime()
        Cache.setItem(file.key, fileUrl, { expires })
        this.setState({ fileUrl })
      })
    }
  }

  render() {
    const { msg, username, ownsPrev, isUser } = this.props
    const { fileUrl } = this.state

    const outerClassName = 'd-inline-flex' + (isUser ? '' : ' flex-row-reverse')
    const innerClassName =
      'chatMsg shadow-sm pt-1 pb-1 px-2 rounded m-2 ' +
      (isUser ? 'bg-info text-white' : 'bg-white text-black')
    const checkStatusClassName =
      'ml-1 ' + (msg.isSent ? 'text-success' : 'text-muted')

    return (
      <div className={outerClassName}>
        <div className={innerClassName}>
          {!ownsPrev ? (
            <div className="font-weight-bold">{username}</div>
          ) : null}
          {msg.file &&
            (fileUrl ? (
              <img alt="awesome" src={fileUrl} className="rounded msg-image" />
            ) : (
              <div className="file-placeholder bg-dark border-dark rounded" />
            ))}
          <div className="">{msg.content}</div>
          <div className="small d-block text-right">
            {formatDate(msg.createdAt)}
            <span className={checkStatusClassName}>
              <i className="fas fa-check" />
            </span>
          </div>
        </div>
      </div>
    )
  }
}
Message.propTypes = {
  msg: PropTypes.object.isRequired,
  username: PropTypes.string.isRequired,
  ownsPrev: PropTypes.bool.isRequired,
  isUser: PropTypes.bool.isRequired
}
