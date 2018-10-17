/* global FileReader */
import React from 'react'
import PropTypes from 'prop-types'
import createMessage from '../graphql/mutations/createMessage'
import getConvoMessages from '../graphql/queries/getConvoMessages'
import { graphql } from 'react-apollo'
import uuid from 'uuid/v4'
import { Popover, PopoverHeader, PopoverBody } from 'reactstrap'

import { Auth } from 'aws-amplify'
import awsmobile from '../aws-exports'

const EMPTY_FILE = {
  bucket: null,
  region: null,
  key: null,
  __typename: 'S3Object'
}
const VISIBILITY = 'protected'

async function getFile(selectedFile) {
  if (!selectedFile) {
    return null
  }

  const bucket = awsmobile.aws_user_files_s3_bucket
  const region = awsmobile.aws_user_files_s3_bucket_region
  const { name: fileName, type: mimeType } = selectedFile
  const [, , , extension] = /([^.]+)(\.(\w+))?$/.exec(fileName)

  const { identityId } = await Auth.currentCredentials()
  const key = `${VISIBILITY}/${identityId}/${uuid()}${extension &&
    '.'}${extension}`

  console.log(fileName, mimeType, extension, key)

  const file = {
    bucket,
    key,
    region,
    mimeType,
    localUri: selectedFile,
    visibility: VISIBILITY
  }

  return file
}

const doCreateMessage = (mutation, content, file, convoId, userId) => () => {
  let contentTrim = content.trim()
  if (!contentTrim.length && file) {
    contentTrim = ' '
  }

  const variables = {
    id: uuid(),
    content: contentTrim,
    messageConversationId: convoId,
    ...(file ? { file } : {})
  }
  mutation({
    variables,
    optimisticResponse: {
      createMessage: {
        __typename: 'Message',
        ...variables,
        ...(file ? { file: EMPTY_FILE } : { file: null }),
        owner: userId,
        isSent: false,
        createdAt: new Date().toISOString()
      }
    },
    update: (proxy, { data: { createMessage: newMsg } }) => {
      const QUERY = {
        query: getConvoMessages,
        variables: { convoId }
      }
      const prev = proxy.readQuery(QUERY)
      const data = {
        getConvoMessages: {
          __typename: 'ModelMessageConnection',
          nextToken: prev.getConvoMessages.nextToken,
          items: [newMsg, ...prev.getConvoMessages.items]
        }
      }
      proxy.writeQuery({ ...QUERY, data })
    }
  })
}

export default class InputBar extends React.Component {
  state = { content: '', popoverOpen: false }
  handleChange = e => {
    this.setState({ content: e.target.value })
  }

  handleFileChange = e => {
    const file = e.target.files[0]
    console.log(file)
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      const self = this
      reader.onload = function(e) {
        self.setState({ popoverOpen: true, filePreviewSrc: this.result })
      }
      reader.readAsDataURL(file)
      this.setState({ file })
    }
  }

  handleSubmit = async e => {
    console.log('submit')
    e.preventDefault()

    const { content, file: selectedFile } = this.state
    const { conversation, userId, createMessage } = this.props

    if (content.trim().length === 0 && !selectedFile) {
      return
    }

    const file = await getFile(selectedFile)
    console.log('file for s3', file)

    const mutator = doCreateMessage(
      createMessage,
      content,
      file,
      conversation.id,
      userId
    )
    this.setState({ content: '', file: undefined, popoverOpen: false }, mutator)
  }

  close = () => {
    this.setState({ file: undefined, popoverOpen: false })
  }

  render() {
    const { filePreviewSrc } = this.state
    const disabled = !this.props.conversation ? { disabled: 'disabled' } : {}
    const imgBtnClass =
      'btn btn-block ' + (this.state.file ? 'btn-success' : 'btn-primary')

    return (
      <div className="entry">
        <div className="px-3 py-2 bg-light">
          <form onSubmit={this.handleSubmit} {...disabled}>
            <div className="row">
              <div className="col-12">
                <div className="d-flex">
                  <div className="file-input-holder">
                    <input
                      type="file"
                      onChange={this.handleFileChange}
                      {...disabled}
                    />
                    <label className={imgBtnClass} id="Popover1">
                      <i className="fas fa-camera" />
                    </label>
                    <Popover
                      placement="top-start"
                      isOpen={this.state.popoverOpen}
                      target="Popover1"
                    >
                      <PopoverHeader>
                        <span>Preview</span>
                        <button
                          type="button"
                          className="close"
                          aria-label="Close"
                          onClick={this.close}
                        >
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </PopoverHeader>
                      <PopoverBody>
                        <img
                          alt="previw"
                          className="msg-image"
                          src={filePreviewSrc}
                        />
                      </PopoverBody>
                    </Popover>
                  </div>
                  <div className="flex-grow-1 px-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      value={this.state.content}
                      onChange={this.handleChange}
                      {...disabled}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      style={{ width: '42px' }}
                    >
                      <i className="fas fa-microphone-alt" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

InputBar.propTypes = {
  createMessage: PropTypes.func,
  conversation: PropTypes.object,
  userId: PropTypes.string
}

const InputBarWithData = graphql(createMessage, {
  name: 'createMessage'
})(InputBar)
export { InputBarWithData }
