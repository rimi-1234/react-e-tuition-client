import { FaUserCog, FaChalkboardTeacher } from 'react-icons/fa'
import MenuItem from './MenuItem'

const AdminMenu = () => {
  return (
    <>
      <MenuItem 
        icon={FaUserCog} 
        label='User Management' 
        address='admin/users' // Links to /dashboard/admin/users
      />
      <MenuItem 
        icon={FaChalkboardTeacher} 
        label='Tuition Management' 
        address='admin/tuitions' // Links to /dashboard/admin/tuitions
      />
    </>
  )
}

export default AdminMenu