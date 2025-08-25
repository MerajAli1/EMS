import { BrowserRouter, Route, Routes } from "react-router";
import Login from "../components/Auth/Login";
import UserLogin from "../userComponent/Auth/Login";
import EmailVerification from "../components/Auth/EmailVerification";
import UserEmailVerification from "../userComponent/Auth/EmailVerification";
import ChangePassword from "../components/Auth/ChangePassword";
import Dashboard from "../components/Dashboard/Dashboard";
import EMSUser from "../userComponent/EMSUser";
import EMSIR from "../userComponent/EMSIR";
import Automation from "../userComponent/Automation";
import EmsAndEMSIR from "../userComponent/EmsAndEMSIR";
import EmsAndEmsIRAutomation from "../userComponent/EmsAndEmsIRAutomation";
import AutomationHD from "../userComponent/AutomationHD";
import Details from "../userComponent/Details";
import ProtectedRoute from "./ProtectedRoute";
import EMSforEMSIR from "../userComponent/EMSforEMSIR";
import IR from "../userComponent/IR";
import EMSUser1 from "../userComponent/EMSUSER1";

const AppRouter = () => {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLogin />} />
          <Route path="/adminLogin" element={<Login />} />
          <Route path="/details" element={<Details />} />

          <Route path="/emailVerification" element={<EmailVerification />} />
          <Route
            path="/userEmailVerification"
            element={<UserEmailVerification />}
          />
          <Route path="/changePassword" element={<ChangePassword />} />

          <Route path="/dashboard" element={
            // <ProtectedRoute>
              <Dashboard />
            // </ProtectedRoute>
          } />
          <Route path="/emsuser" element={
            <ProtectedRoute>
              <EMSUser1 />
            </ProtectedRoute>
          } />
           <Route path="/emsuser1" element={
            <ProtectedRoute>
              <EMSUser1 />
            </ProtectedRoute>
          } />
          <Route path="/emsuserforemsir" element={
            <ProtectedRoute>
              <EMSforEMSIR />
            </ProtectedRoute>
          } />
          <Route path="/emsir" element={
            <ProtectedRoute>
              <EMSIR />
            </ProtectedRoute>
          } />
          
          <Route path="/automation" element={
            <ProtectedRoute>
              <Automation />
            </ProtectedRoute>
          } />
          <Route path="/emsAndEmsir" element={
            <ProtectedRoute>
              <EmsAndEMSIR />
            </ProtectedRoute>
          } />
          <Route path="/ir" element={
            <ProtectedRoute>
              <IR />
            </ProtectedRoute>
          } />
          <Route path="/emsAndEmsirAutomation" element={
            <ProtectedRoute>
              <EmsAndEmsIRAutomation />
            </ProtectedRoute>
          } />
          <Route path="/automationhd" element={
            <ProtectedRoute>
              <AutomationHD />
            </ProtectedRoute>
          } />
        </Routes>
        {/* automationhd */}
        {/* ems+emsir */}
        {/* ems+emsir+automation */}
      </BrowserRouter>
    </>
  );
};

export default AppRouter;
