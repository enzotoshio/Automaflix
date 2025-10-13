import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from './Input'

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      // Setup
      const placeholder = 'Enter text'

      // Exercise
      render(<Input placeholder={placeholder} />)

      // Verify
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', placeholder)
    })

    it('should render with custom type and className props', () => {
      // Setup
      const inputType = 'email'
      const customClass = 'custom-input'
      const placeholder = 'Enter email'

      // Exercise
      render(
        <Input
          type={inputType}
          className={customClass}
          placeholder={placeholder}
        />,
      )

      // Verify
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', inputType)
      expect(input).toHaveAttribute('placeholder', placeholder)
      expect(input).toHaveClass(customClass)
    })
  })
})
