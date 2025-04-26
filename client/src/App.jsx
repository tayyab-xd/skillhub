import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import { Appprovider } from './context/context';
import "react-toastify/dist/ReactToastify.css";
import Learn from './pages/Learn'
import Signup from './pages/Signup'
import Login from './pages/Login'
import UploadCourse from './pages/UploadCourse'
import NavbarLearn from './components/NavbarLearn'
import Courses from './pages/Courses'
import SingleCourse from './pages/SingleCourse';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import EditCourse from './pages/EditCourse';
import EarnHome from './pages/EarnHome';
import UploadGig from './pages/UploadGig';
import Gigs from './pages/Gigs';
import SingleGig from './pages/SingleGig';

function App() {

  return (
    
    <BrowserRouter>
    <Appprovider>
      <NavbarLearn />
      <ToastContainer/>
        <Routes>
          <Route path='/learn' element={<Learn />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/courses' element={<Courses />} />
          <Route path='/upload' element={<UploadCourse />} />
          <Route path='/singlecourse/:id' element={<SingleCourse/>} />
          <Route path='/profile/:id' element={<Profile/>} />
          <Route path='/edit-profile' element={<EditProfile/>} />
          <Route path='/edit-course' element={<EditCourse/>} />
          {/* earn mode */}
          <Route path='/earn' element={<EarnHome/>} />
          <Route path='/uploadgig' element={<UploadGig />} />
          <Route path='/gigs' element={<Gigs />} />
          <Route path='/singlegig/:id' element={<SingleGig/>} />
        </Routes>
    </Appprovider>
    </BrowserRouter>
  )
}

export default App