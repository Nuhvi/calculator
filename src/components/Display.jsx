import React from 'react';
import PropTypes from 'prop-types';
import './Display.scss';

const Display = ({ total }) => (
  <div className="Display">
    <p className="Display__total">{total}</p>
  </div>
);

Display.propTypes = {
  total: PropTypes.string.isRequired,
};

export default Display;
