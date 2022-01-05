/**
 *   The App component manages routing and authentication
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import React from 'react';
import SidebarNavigation from './sidebar-navigation';

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<SidebarNavigation/>}/>
      </Routes>
    </Router>
  );
}

export default App;
