const jwt = require('jsonwebtoken');
require ('dotenv').config();

const protect = (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1];

            // Decote the token
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

            req.user = {
                id: decodedToken.id,
                role: decodedToken.role,
                member_id: decodedToken.member_id
            }

            next();
        }catch(error){
            console.error(error);
            return res.status(401).json({ error: 'Not Authorised, token failed'});
        }
    }
    if(!token){
        return res.status(401).json({ error: 'Not Authorised, No token'});
    };
};
// Check roles
const adminsOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin')
        next();
    else {
        return res.status(403).json({ error: 'Access denied. Admins only'});
    }
};

const adminsOrTreasurer = (req, res, next) => {
    if(req.user && req.user.role === 'admin' || res.user.role === 'treasurer')
        next();
    else{
        return res.status(403).json({ error: 'Access Denied. Admins and Treasurer only'});
    }
}
module.exports = { protect, adminsOnly, adminsOrTreasurer };