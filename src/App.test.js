import { render, screen } from '@testing-library/react';
import App from './App';

test('renders auth screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/Iniciar Sesión/i);
  expect(linkElement).toBeInTheDocument();
});
