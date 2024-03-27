import DashboardData from "../../../shared/modules/dashboard/dashboard.data";
import DashboardOverview from "../../../shared/modules/dashboard/dashboard.overview";
import { headers } from "next/headers";
import Sidebar from "../../../shared/components/layout/Sidebar";
import Protected from "@/utils/protected";

const Page = () => {
  const heads = headers();
  const pathname = heads.get("next-url");

  return (
    <>
      <div className="w-full flex">
        {pathname !== "/login" &&
          pathname !== "/register" &&
          pathname !== "/activate-account/[key]" && (
            <div className="w-[350px] h-screen sticky top-0 left-0 z-50">
              <Sidebar />
            </div>
          )}
        {/* <Protected> */}
        <div className="w-full h-screen flex flex-col justify-center">
          <DashboardOverview />
          <DashboardData />
        </div>
        {/* </Protected> */}
      </div>
    </>
  );
};

export default Page;
