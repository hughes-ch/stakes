/**
 *   Tests for the ProfileSidebar component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import ProfileSidebar from './profile-sidebar';
import { render } from '@testing-library/react';

describe('The ProfileSidebar component', () => {
  it('renders without exploding', () => {
    render(
      <ProfileSidebar>
        <span>Hello world!</span>
      </ProfileSidebar>
    );
  });
});
