/**
 *   Tests for the SearchBar component
 *
 *   :copyright: Copyright (c) 2022 Chris Hughes
 *   :license: MIT License
 */
import "@testing-library/jest-dom";
import config from './config';
import { render, screen } from '@testing-library/react';
import SearchBar from './search-bar';
import userEvent from '@testing-library/user-event';

/**
 * Global setup and teardown
 */
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

afterEach(() => {
  mockNavigate.mockReset();
});

/**
 * Unit tests
 */
describe('The SearchBar component', () => {
  it('can initiate a search', async () => {
    const query = 'Hello world!';
    render(<SearchBar/>);

    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, query);
    screen.getByRole('button').click();

    const searchUrl = `${config.URL_SEARCH}/${encodeURIComponent(query)}`;
    expect(mockNavigate).toHaveBeenCalledWith(searchUrl);
  });

  it('does not allow empty searches', async () => {
    render(<SearchBar/>);
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
