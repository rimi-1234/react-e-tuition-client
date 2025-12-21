import { FaSearch, FaRegListAlt, FaUserEdit, FaChalkboardTeacher } from 'react-icons/fa'
import MenuItem from './MenuItem'

const TutorMenu = () => {
  return (
    <>
      <MenuItem
        icon={FaChalkboardTeacher}
        label='Ongoing Tuitions'
        address='ongoing-tuitions'  // Matches path: 'ongoing-tuitions'
      />

      {/* 2. Track Applications */}
      <MenuItem
        icon={FaRegListAlt}
        label='My Applications'
        address='my-applications'
      />


    </>
  )
}

export default TutorMenu