/**
 *   The SearchContentCard contains a single result from a search query
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import React from 'react';

/**
 * Component
 *
 * @param {Object} props The props passed to this component
 */
function SearchContentCard(props) {
  return (
    <span>{ props.account }</span>
  );
}

export default SearchContentCard;
