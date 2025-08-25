import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import login from "../../assets/login.png";
import Header from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const hardcodedEmail = "test@example.com";
    const hardcodedPassword = "password123";

    if (email === hardcodedEmail && password === hardcodedPassword) {
      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <h2 className="mb-4">Login</h2>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputGroup.Text>
                    <i className="bi bi-info-circle"></i>
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputGroup.Text
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className={`bi ${
                        showPassword ? "bi-eye" : "bi-eye-slash"
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
                  Login
                </Button>
                <Link
                  to={"/changePassword"}
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Forget password?
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

export default LoginPage;
