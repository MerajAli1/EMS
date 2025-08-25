const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const cors = require("cors");
const { query, check, validationResult } = require("express-validator");
const User = require("../models/user");

app.use(
  cors({
    origin: "*",
  })
);
const {
  createUser,
  signin,
  getAllUsers,
  updateServiceStatus,
  changePassword,
  changeUserStatus,
  deleteUser,
  unitsNotification,
  getUnitsNotification,
} = require("../controller/user");

function authenticateToken(req, res, next) {
  const authtoken = req.cookies.jwt;
  console.log(authtoken);
  if (authtoken) {
    jwt.verify(
      authtoken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.status(401).send({ error: "Unauthorizeds" });
        } else {
          req.officeHolder = decodedToken;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ error: "Unauthorizeds" });
  }
}

router.route("/createUser").post(createUser);
router.route("/signin").post(signin);
router.route("/getAllUser").post(getAllUsers);
router.route("/updateServiceStatus").post(updateServiceStatus);
router.route("/changePassword").post(changePassword);
router.route("/changeStatus").post(changeUserStatus);
router.route("/deleteUser").post(deleteUser);

router.route("/unitsNotification").post(unitsNotification);

router.route("/getUnitsNotification").get(getUnitsNotification);

// router.route("/SendRepeatToken").post(handleRepeatTokenSend);
// router.route("/verifyToken").post(VerifyToken);
// router.route("/forgetPasswordChange").post(forgetPasswordChange);
// router.route("/forgetPasswordSend").post(forgetPasswordSend);
// router.route("/changeForgetPassword").post(changeForgetPassword);

module.exports = router;
