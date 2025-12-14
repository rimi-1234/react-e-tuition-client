import { FaSearch, FaRegListAlt, FaUserEdit } from 'react-icons/fa'
import MenuItem from './MenuItem'

const TutorMenu = () => {
  return (
    <>
      {/* 1. Browse Jobs (Instead of 'Add Tuition') */}
      <MenuItem
        icon={FaSearch}
        label='Find Tuitions' 
        address='job-feed'
      />

      {/* 2. Track Applications */}
      <MenuItem
        icon={FaRegListAlt}
        label='My Applications'
        address='my-applications'
      />

      {/* 3. Profile Management */}
      <MenuItem
        icon={FaUserEdit}
        label='Update Profile'
        address='my-profile'
      />
    </>
  )
}

export default TutorMenu