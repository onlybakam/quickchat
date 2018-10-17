import React from 'react'
import PropTypes from 'prop-types'

const ConversationBar = ({ conversation, name, switchView }) => {
  const title = 'ChatQl' + (name ? ` > ${name}` : '')
  return (
    <div className="topbar">
      <nav className="navbar navbar-expand-lg navbar-light bg-primary">
        <button
          className="navbar-toggler mr-2"
          type="button"
          onClick={switchView}
        >
          <i className="fas fa-chevron-circle-left" />
        </button>
        <span className="navbar-brand">{title}</span>
        <div className="d-flex flex-grow-1" />
      </nav>
    </div>
  )
}
ConversationBar.propTypes = {
  conversation: PropTypes.object,
  name: PropTypes.string,
  switchView: PropTypes.func.isRequired
}

export default ConversationBar
