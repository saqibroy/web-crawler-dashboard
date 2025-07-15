import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, describe, test, vi } from 'vitest'
import DashboardForm from '../components/Dashboard/DashboardForm'

describe('DashboardForm', () => {
  const setup = (props = {}) => {
    const onSubmit = vi.fn()
    render(<DashboardForm onSubmit={onSubmit} isLoading={false} {...props} />)
    const input = screen.getByPlaceholderText(/enter website url/i)
    const button = screen.getByRole('button', { name: /analyze url/i })
    return { input, button, onSubmit }
  }

  test('input field updates state correctly', () => {
    const { input } = setup()
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    expect(input).toHaveValue('https://example.com')
  })

  test('form submits the URL when valid', () => {
    const { input, button, onSubmit } = setup()
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)
    expect(onSubmit).toHaveBeenCalledWith('https://example.com')
  })

  test('input clears after submission', async () => {
    const { input, button } = setup()
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(button)
    await waitFor(() => expect(input).toHaveValue(''))
  })

  test('submit button is disabled when input is empty or isLoading', () => {
    const { button } = setup()
    expect(button).toBeDisabled()
    // isLoading disables button
    const onSubmit = vi.fn()
    render(<DashboardForm onSubmit={onSubmit} isLoading={true} />)
    const loadingButton = screen.getByRole('button', { name: /analyze url/i })
    expect(loadingButton).toBeDisabled()
  })
})
