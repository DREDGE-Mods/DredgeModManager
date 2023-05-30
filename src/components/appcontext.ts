import React from 'react'
import App from '../App'

const AppContext = React.createContext<App | null>(null)

export const AppProvider = AppContext.Provider
export const AppConsumer = AppContext.Consumer

export default AppContext