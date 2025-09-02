import express from 'express'
import jwt from 'jsonwebtoken';
const publicRouter = express.Router();
// firstName, lastName, email, password
let users = [];

const isValid = (email) => !!users.find((user) => user.email === email)
const authenticatedUser = (email, password) => !!users.find((u) => u.email === email && u.password === password);

// #7
//login
publicRouter.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (authenticatedUser(email, password)) {
    let accessToken = jwt.sign({data:email}, "access", {expiresIn: 3600});
    req.session.authorization = {accessToken,email};
    const findUser = users.find((user) => user.email === email);
    return res.status(200).send(`User ${findUser.firstName} successfully logged in`);
  }
  else {
    return res.status(401).send("Invalid email or password");
  }
});


//#6
//  Register a new user
publicRouter.post("/auth/register", (req,res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email or password not specified" });
  }
  const busyEmail = isValid(email)
  if (busyEmail) {
    return res.status(401).json({ message: "Email already exists" });
  }
  users.push({ firstName, lastName, email, password });
  return res.send(`User ${firstName} registered successfully`);
});





export default publicRouter; 