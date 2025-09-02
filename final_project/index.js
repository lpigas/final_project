import express from 'express';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import customer_routes from './router/auth.js';
import genl_routes from './router/general.js';

const app = express();

app.use(express.json());

app.use(session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/review/*", function auth(req,res,next){
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(403).send("User not authenticated");
            }
        });
    } else {
        return res.status(401).send("User not logged in");
    }
});
 
const PORT =3333;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
