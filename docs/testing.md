# Testing

## Philosophy

The core idea of testing is to make sure the application can be used as intended. The more the tests resemble the way the application is used, the more confidence the tests can give. **Focus on the outcomes, not the internals.**

## Packages

| Package | Purpose |
|---------|---------|
| Jest | Test runner |
| React Testing Library | Renders and tests components |

## What to Test

- UI logic (conditional rendering)
- Event handling (clicks and input)
- Component state behavior
- Edge cases and security

**Avoid** testing internal states directly.

## Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Runs all tests once |
| `npm run test:watch` | Watches for file changes and runs relevant tests. Use during development/debugging. |
| `npm run test:coverage` | Runs tests and measures coverage (which lines ran, how much of each file was tested) |

## Conventions

- Use **1 file** to test one module/component
- Use `describe` to group different tests; nest them if necessary
- Test names describe **high-level behavior**, not actual code
- Test **edge cases** and for **security**

## Template

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import Component from './Component'

describe('Component', () => {
  test('renders expected text', () => {
    render(<Component />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  test('handles user interaction', () => {
    render(<Component />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

## Useful Links and Tutorials

- **Jest:** [Getting Started](https://jestjs.io/docs/getting-started)
- **React Testing Library:** [Example Intro](https://testing-library.com/docs/react-testing-library/example-intro)
- [What Is React Testing Library?](https://testing-library.com/)
- [Testing In React Tutorial - Jest and React Testing Library](https://www.youtube.com/results?search_query=Testing+In+React+Tutorial+Jest+and+React+Testing+Library)
