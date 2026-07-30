import { lazy, ComponentType } from 'react'

/**
 * Helper function to safely handle dynamic import failures when new deployments occur on Vercel.
 * If a stale chunk filename is requested after a new deployment, it automatically reloads the window
 * once to fetch the latest production bundle without breaking the user experience.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasBeenRefreshed = window.sessionStorage.getItem('page-has-been-refreshed')
    try {
      const component = await componentImport()
      window.sessionStorage.setItem('page-has-been-refreshed', 'false')
      return component
    } catch (error: any) {
      if (!pageHasBeenRefreshed || pageHasBeenRefreshed === 'false') {
        window.sessionStorage.setItem('page-has-been-refreshed', 'true')
        window.location.reload()
      }
      throw error
    }
  })
}
