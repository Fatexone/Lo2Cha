// middleware/auth.js

// Middleware d'authentification
export function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
}
