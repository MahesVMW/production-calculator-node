const express = require("express");
const userController = require("../controllers/users"); 
const router = express.Router();

router.post("/register",userController.register); 
router.post("/login",userController.login); 
router.post("/logout",userController.logout); 
router.post("/dashboard",userController.dashboard); 
router.get("/dashboard/:id",userController.delete);
module.exports = router; 