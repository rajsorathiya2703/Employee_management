"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_service_1 = require("./auth.service");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Access token required." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, auth_service_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};
exports.authenticate = authenticate;
