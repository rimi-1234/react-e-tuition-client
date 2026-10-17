import { NavLink } from 'react-router';

const MenuItem = ({ label, address, icon: Icon }) => {
  return (
    <NavLink
      to={address}
      end
      className={({ isActive }) =>
        `flex items-center px-4 py-2 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span className="mx-4 font-medium">{label}</span>
    </NavLink>
  );
};

export default MenuItem;
