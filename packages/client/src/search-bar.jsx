/**
 *   The SearchBar component allows users to search for other users
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './search-bar.css';
import config from './config';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

/**
 * Component
 */
function SearchBar() {
  const [error, setError] = useState(false);
  const [searchText, setSearchText] = useState('Search');
  const validate = (e) => {
    setSearchText(e.target.value);
    if (e.target.value === '') {
      setError(true);
    } else {
      setError(false);
    }
  };

  const navigateTo = useNavigate();
  const performSearch = (e) => {
    e.preventDefault();
    const queryString = e.target.elements[config.SEARCH_ENTRY_NAME].value;
    navigateTo(`${config.URL_SEARCH}/${encodeURIComponent(queryString)}`);
  };
  
  return (
    <form className='search-bar' onSubmit={ performSearch }>
      <input type='text'
             id={ config.SEARCH_ENTRY_NAME }
             name={ config.SEARCH_ENTRY_NAME }
             onChange={ validate }
             value={ searchText }
             onClick={ () => {
               setSearchText('');
               setError(true);
             }}/>
      <input type='submit'
             value='&#128270;'
             disabled={ error }/>
    </form>
  );
}

export default SearchBar;
