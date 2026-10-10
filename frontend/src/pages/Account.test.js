import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Account from './Account';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

jest.mock('../context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../axiosConfig', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}));

describe('Account', () => {
  const user = { id: 'user-1', name: 'Jasmine', email: 'jasmine@example.com', token: 'token-1' };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user });
    axiosInstance.get.mockResolvedValue({
      data: {
        id: 'user-1',
        name: 'Jasmine',
        email: 'jasmine@example.com',
        university: 'QUT',
        address: 'Sunshine Coast, Australia',
      },
    });
  });

  it('loads and displays the authenticated user account', async () => {
    render(<MemoryRouter><Account /></MemoryRouter>);

    expect(await screen.findByText('Jasmine')).toBeInTheDocument();
    expect(screen.getByText('jasmine@example.com')).toBeInTheDocument();
    expect(screen.getByText('QUT')).toBeInTheDocument();
    expect(screen.queryByText('Member since')).not.toBeInTheDocument();
    expect(axiosInstance.get).toHaveBeenCalledWith('/api/auth/profile', {
      headers: { Authorization: 'Bearer token-1' },
    });
  });

  it('shows a clear value when an optional account detail is missing', async () => {
    axiosInstance.get.mockResolvedValue({
      data: {
        id: 'user-1',
        name: 'Jasmine',
        email: 'jasmine@example.com',
        university: '',
        address: '',
      },
    });
    render(<MemoryRouter><Account /></MemoryRouter>);

    expect(await screen.findAllByText('Not provided')).toHaveLength(2);
  });
});
