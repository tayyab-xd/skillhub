import { useState, createContext, useReducer, useEffect } from "react"
import axios from "axios"
import { reducer } from "./reducer"

const  AppContext = createContext()

const Appprovider = ({ children }) => {
    const initialState = {
        courses: [],
        filterCourses:[],
        populerCourses:[],
        loggedIn:false,
        profileData:[]
    }
    const [state, dispatch] = useReducer(reducer, initialState)

    // for courses
    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await axios.get('http://localhost:3000/course/all-courses');
                dispatch({ type: 'SET_COURSES', payload: response.data });
            } catch(error) {
                console.log(error);
            }
        }
        fetchData()
    }, []);

    // for profile
    useEffect(() => {
        const fetchUser=async()=>{
            try {
                const fetchData=await axios.get(`http://localhost:3000/user/profile/${localStorage.getItem('userId')}`)
                // console.log(fetchData.data)
                dispatch({type:'SET_PROFILE',payload:fetchData.data})
            } catch (error) {
                console.log(error)
            }
        }
        fetchUser()
    }, [state.loggedIn])
    
    useEffect(() => {
      const token=localStorage.getItem('token')
      if (token) {
        dispatch({type:'LOGGED_IN',payload:true})
      }
    }, [])
    

    return (
        <AppContext.Provider value={{ state,dispatch }}>{children}</AppContext.Provider>
    )
}

export { AppContext, Appprovider }