/**
 *   The Heading component contains the page title and the search bar
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './heading.css';
import React from 'react';
import SearchBar from './search-bar';

/**
 * Component
 */
function Heading(props) {
  return (
    <div className='heading'>
      <h1>{ props.title }</h1>
      <SearchBar/>
    </div>
  );
}

export default Heading;
