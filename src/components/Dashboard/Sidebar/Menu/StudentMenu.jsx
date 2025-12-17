import { BsFillHouseAddFill } from 'react-icons/bs'
import { MdHomeWork, MdOutlineManageHistory } from 'react-icons/md'
import MenuItem from './MenuItem'
import { MdPayment } from 'react-icons/md';
const StudentMenu = () => {
  return (
    <>
      {/* 1. Post New Tuition */}
      <MenuItem
        icon={BsFillHouseAddFill}
        label='Post New Tuition'
        address='post-tuition'  
      />

      {/* 2. My Posted Tuitions (formerly My Inventory) */}
      <MenuItem 
        icon={MdHomeWork} 
        label='My Tuitions' 
        address='my-posts' 
      />

      {/* 3. Manage Applications (formerly Manage Orders) */}
      <MenuItem
        icon={MdOutlineManageHistory}
        label='Applied Tutors'
        address='applied-tutors'
      />
      <MenuItem
    icon={MdPayment}
    label='Payment History'
    address='payment-history'
/>
    </>
  )
}

export default StudentMenu