import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const Header = ({ onExportPdf }) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);

    // Add a small delay to show the loading state
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
      setIsLoggingOut(false);
    }, 1000);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <Navbar
        className="sticky-top bg-white ml-2"
        style={{ marginLeft: "250px" }}
      >
        <Container>
          <h1 className="display-5">Energy Monitoring System</h1>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
              <button
                onClick={onExportPdf} // <--- CALL THE PASSED FUNCTION
                className="btn  me-2"
                style={{ backgroundColor: "#775F83", color: "white" }}
              >
                Export Data
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={handleCancelLogout} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-question-circle text-warning me-2"></i>
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">Are you sure you want to logout?</p>
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            You will be redirected to the login page and will need to sign in
            again to access your dashboard.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelLogout}>
            <i className="bi bi-x-circle me-1"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>
            Yes, Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Header;
