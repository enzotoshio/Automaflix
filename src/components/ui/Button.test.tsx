import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      // Setup
      const buttonText = 'Click me'

      // Exercise
      render(<Button>{buttonText}</Button>)

      // Verify
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(buttonText)
    })

    it('should render with custom variant and size props', () => {
      // Setup
      const buttonText = 'Submit'
      const variant = 'outline'
      const size = 'lg'

      // Exercise
      render(
        <Button variant={variant} size={size}>
          {buttonText}
        </Button>,
      )

      // Verify
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent(buttonText)
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('h-11')
    })
  })
})
