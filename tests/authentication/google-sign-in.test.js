import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleSignIn from '../../src/app/components/google-sign-in';
import { supabase } from '../../src/app/lib/db';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn()
  }))
}));

jest.mock('../../src/app/lib/db', () => ({
  supabase: {
    auth: {
      signInWithIdToken: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }))
    }
  }
}));

test('shows error message when sign in fails with invalid email', async () => {
  supabase.auth.signInWithIdToken.mockResolvedValue({
    data: null,
    error: { message: 'Invalid email' }
  });

  render(<GoogleSignIn />);

  // Simulate handling credential response
  await act(async () => {
    await window.handleCredentialResponse({ credential: 'fake-token' });
  });

  expect(await screen.findByText(/Please sign in with a valid UCLA email/i)).toBeInTheDocument();
});
