import axios from "axios"
import { createContext, useContext, useEffect, useState } from "react"
import Loader from "../components/Loader"
import api from "../services/Api"

const LoaderContext = createContext()

export function LoaderProvider({ children }) {

  const [loading, setLoading] = useState(false)

  useEffect(() => {

    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        setLoading(true)
        return config
      },
      (error) => {
        setLoading(false)
        return Promise.reject(error)
      }
    )

    const responseInterceptor = api.interceptors.response.use(
      (response) => {
        setLoading(false)
        return response
      },
      (error) => {
        setLoading(false)
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }

  }, [])

  return (
    <LoaderContext.Provider value={{}}>
      {loading && <Loader />}
      {children}
    </LoaderContext.Provider>
  )
}

export function useLoader() {
  return useContext(LoaderContext)
}
