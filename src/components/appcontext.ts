import React from 'react'
import App from '../App'

export const AppContext = React.createContext<App | null>(null)
export const AppProvider = AppContext.Provider
export const AppConsumer = AppContext.Consumer
