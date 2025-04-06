import React from 'react'

import HeroLearn from '../components/HeroLearn'
import CategoriesLearn from '../components/CategoriesLearn'
import PopularCourses from '../components/PopularCourses'
import Footer from '../components/FooterLearn'
import NavbarLearn from '../components/NavbarLearn'

function Learn() {
  return (
    <div>
      <NavbarLearn/>
      <HeroLearn />
      <CategoriesLearn />
      <PopularCourses />
      <Footer />
    </div>
  );
  
}

export default Learn
