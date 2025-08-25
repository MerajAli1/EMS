import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import login from "../../assets/login.png";
import Header from "../Navbar";
import { Link } from "react-router-dom";
import { useState } from "react";

const ChangePassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <Header />
      <Container
        fluid
        style={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}
      >
        <Row className="align-items-center" style={{ minHeight: "100vh" }}>
          <Col md={6} className="p-5">
            <h2 className="mb-4">Change Password</h2>
            <Form>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password"
                  />
                  <InputGroup.Text
                    onClick={toggleNewPasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        showNewPassword ? "bi-eye" : "bi-eye-slash"
                      }`}
                    ></i>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                  />
                  <InputGroup.Text
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        showConfirmPassword ? "bi-eye" : "bi-eye-slash"
                      }`}
                    ></i>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                <Button
                  variant="primary"
                  type="submit"
                  className="px-4 rounded-pill w-50"
                >
                  Confirm
                </Button>
                <Link
                  to={"/"}
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Back to Login
                </Link>
              </div>
            </Form>
          </Col>

          <Col md={6} className="text-center p-4">
            <img
              width={"60%"}
              src={login}
              alt="Not Found"
              className="img-fluid"
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ChangePassword;
