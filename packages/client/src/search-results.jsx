/**
 *   The SearchResults component displays users that match a search query
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import './search-results.css';
import CenteredContentBox from './centered-content-box';
import config from './config';
import { getReasonablySizedName } from './common';
import Heading from './heading';
import React, { useContext, useEffect, useState } from 'react';
import SearchContentCard from './search-content-card';
import { useParams } from "react-router-dom";
import Web3Context from './web3-context';

/**
 * Component
 */
function SearchResults() {
  const params = useParams();
  const [query, setQuery] = useState(undefined);
  useEffect(() => {
    setQuery(decodeURIComponent(params[config.URL_SEARCH_PARAM]));
  }, [params]);
  
  const web3 = useContext(Web3Context);
  const [searchResults, setSearchResults] = useState('');
  useEffect(() => {
    async function findSearchResults() {
      if (query === undefined) {
        return;
      }

      let accounts;
      try {
        const hasUserConnected = await web3.contracts.stake.userHasConnected(
          query
        );
        if (hasUserConnected) {
          accounts = [query];
        }
      } catch(err) {
        const results = await web3.contracts.stake.searchForUserName(
          query, 0, config.SEARCH_RESULT_COUNT
        );

        accounts = results.filter(result => result.search(/[^x0]/) >= 0);
      }

      if (accounts.length) {
        setSearchResults(accounts.map(account => (
          <div key={ account } className='search-content-container'>
            <SearchContentCard account={ account }/>
          </div>
        )));
      } else {
        setSearchResults(<span>No results found</span>);
      }
    }
    findSearchResults();
  }, [query, web3]);
  
  return (
    <CenteredContentBox>
      <div className='search-results'>
        <Heading
          title={ `Search Results for "${getReasonablySizedName(query)}"` }
        />
        { searchResults }
      </div>
    </CenteredContentBox>
  );
}

export default SearchResults;
