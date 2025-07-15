import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<any>
    return (
      axiosError.response?.data?.message ||
      ('message' in axiosError ? (axiosError as { message: string }).message : undefined) ||
      'An unexpected error occurred.'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred.'
}

export function isNetworkError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true &&
    !(error as AxiosError).response
  )
}
