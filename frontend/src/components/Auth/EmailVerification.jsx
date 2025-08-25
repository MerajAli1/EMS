import { Container, Row, Col, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mail from "../../assets/mail.png";
import Header from "../Navbar";
const EmailVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();

  const handleVerify = () => {
    if (otp.join("") === "000000") {
      navigate("/dashboard");
    } else {
      alert("Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const handleChange = (value, index) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to the next input if it exists
      if (index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
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
            <div>
              <div className="mb-4">
                <span style={{ cursor: "pointer", marginRight: "10px" }}>
                  <i class="bi bi-arrow-left"></i>
                </span>
                <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                  Email Verification
                </span>
                <p className="fs-5">
                  Enter the 6 digit OTP we have send to your email{" "}
                </p>
              </div>

              <p>Enter the 6 digit OTP we have sent to your email</p>
              <div className="d-flex gap-2 mb-3">
                {[...Array(6)].map((_, idx) => (
                  <input
                    id={`otp-input-${idx}`}
                    key={idx}
                    type="text"
                    maxLength="1"
                    value={otp[idx]}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    style={{
                      width: "50px",
                      height: "50px",
                      textAlign: "center",
                      fontSize: "20px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                ))}
              </div>
              <p>
                Didn’t receive an OTP?{" "}
                <a
                  style={{ textDecoration: "none", color: "#007bff" }}
                  href="#"
                >
                  Resend
                </a>
              </p>

              <Button
                variant="primary"
                className="px-5"
                onClick={handleVerify}
              >
                Verify
              </Button>
            </div>
          </Col>

          <Col md={6} className="text-center p-4">
            <img
              width={"60%"}
              src={mail}
              alt="Email illustration"
              className="img-fluid"
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EmailVerification;
