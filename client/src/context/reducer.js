export const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_COURSES':
            return {
                ...state,
                courses: action.payload,
                filterCourses: action.payload,
                populerCourses:action.payload.slice(0,1)
            }
        case 'LOGGED_IN':
            return {
                ...state,
                loggedIn: action.payload
            }
        case 'SET_PROFILE':
            return {
                ...state,
                profileData: action.payload
            }
        case 'FILTER_TITLE':
            return {
                ...state,
                filterCourses: state.courses.filter((item) =>
                    item.title.toLowerCase().replace(/\s/g, '').includes(action.payload.toLowerCase().replace(/\s/g, '')
                    )
                )
            };
        case 'FILTER_CATEGORY':
            return {
                ...state,
                filterCourses: state.courses.filter((item) =>
                    item.category.toLowerCase().includes(action.payload.toLowerCase()))
            };
        
        default:
            return state
    }
}