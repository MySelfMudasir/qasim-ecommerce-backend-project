import jwt from 'jsonwebtoken';
import { getUserById } from '../../models/authModel.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = null;
    // Authorization Header
    const authHeader = req.headers.authorization;
    // console.log("Authorization Header:", authHeader);

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account disabled"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};


// export const verifyCookies = (req, res, next) => {
//   try {
//     const token = req.cookies.token;
//     console.log("Cookie Header:", token);

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'No token provided12345'
//       });
//     }
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET
//     );
//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token12345'
//     });
//   }
// };