import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import login from "../../assets/login.png";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Navbar";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        // Redirect based on service if already logged in
        switch (parsedUser.Service) {
          case "EMS":
            navigate("/emsuser");
            break;
          case "EMS (IR)":
            navigate("/emsir");
            break;
          case "Automation":
            navigate("/automation");
            break;
          case "EMS + EMS(IR)":
            navigate("/emsAndEmsir");
            break;
          case "EMS + EMS(IR) + Automation":
            navigate("/emsAndEmsirAutomation");
            break;
          case "Automation(HD)":
            navigate("/automationhd");
            break;
          case "IR":
            navigate("/ir");
            break;
          default:
            // If no specific service, redirect to dashboard
            navigate("/emsuser");
            break;
        }
      } catch (error) {
        // If there's an error parsing user data, clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        " http://localhost:2000/api/user/signin",
        {
          UserId: email,
          Password: password,
        }
      );

      const { message, token, user } = res.data;

      if (message === "Signin successful") {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on service
        switch (user.Service) {
          case "EMS":
            navigate("/emsuser");
            break;
          case "EMS (IR)":
            navigate("/emsir");
            break;
          case "Automation":
            navigate("/automation");
            break;
          case "EMS + EMS(IR)":
            navigate("/emsAndEmsir");
            break;
          case "EMS + EMS(IR) + Automation":
            navigate("/emsAndEmsirAutomation");
            break;
          case "Automation(HD)":
            navigate("/automationhd");
            break;
          case "IR":
            navigate("/ir");
            break;
          default:
            // Fallback to EMS user if service type not recognized
            navigate("/emsuser");
            break;
        }
      } else {
        alert("Invalid login response.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "An error occurred during login.");
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    if (!isLoading) {
      setShowPassword(!showPassword);
    }
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
            <div style={{ position: "relative" }}>
              {isLoading && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px"
                }}>
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Authenticating...</p>
                  </div>
                </div>
              )}
              <h2 className="mb-4">Login</h2>
              <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="Text"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <InputGroup.Text
                    onClick={togglePasswordVisibility}
                    style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
                <Link
                  to={"/changePassword"}
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Forget password?
                </Link>
              </div>
              </Form>
            </div>
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
