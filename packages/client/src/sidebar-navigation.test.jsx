/**
 *   Tests for the SidebarNavigation component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import { BrowserRouter as Router } from "react-router-dom";
import SidebarNavigation from './sidebar-navigation';
import {render, screen} from '@testing-library/react';

describe('The SidebarNavigation component', () => {
  it('renders without exploding', () => {
    render(
      <Router>
        <SidebarNavigation/>
      </Router>
    );
  });
});
