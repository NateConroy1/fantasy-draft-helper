import React from 'react';
import PropTypes from 'prop-types';

import Header from './header';
import './layout.css';

const Layout = ({ children }) => (
  <>
    <Header />
    <div
      style={{
        height: '100vh',
        width: 'max-content',
        minWidth: '100%',
        background: '#293742',
        paddingTop: '5em',
        paddingBottom: '5em',
      }}
    >
      {children}
      <footer style={{ color: '#CED9E0', paddingTop: '2em', paddingLeft: '2em' }}>
        {`© Nate Conroy, ${new Date().getFullYear()}`}
      </footer>
    </div>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
