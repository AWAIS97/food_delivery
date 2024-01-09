import styles from "@/src/app/utils/styles";
import NavItems from "../NavItems";
import ProfileDropDown from "../ProfileDropDown";

const Header = () => {
  return (
    <header className="w-full bg-[#0F1524] ">
      <div className="w-[90%] m-auto flex items-center justify-between h-[80px]">
        <h1 className={`${styles.logo}`}>Food App</h1>
        <NavItems />
        <ProfileDropDown />
      </div>
    </header>
  );
};

export default Header;
