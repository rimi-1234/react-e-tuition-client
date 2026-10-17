import { FaUserCog, FaChalkboardTeacher, FaBell } from 'react-icons/fa'
import MenuItem from './MenuItem'

const AdminMenu = () => {
  return (
    <>
      <MenuItem
        icon={FaUserCog}
        label='User Management'
        address='admin/users'
      />
      <MenuItem
        icon={FaChalkboardTeacher}
        label='Tuition Management'
        address='admin/tuitions'
      />
    </>
  )
}

export default AdminMenu